jQuery(document).ready(function ($) {
    var bulkFrame;
    var bulkItems = [];

    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) {
            return '--';
        }
        var units = ['B', 'KB', 'MB', 'GB'];
        var index = 0;
        var value = bytes;
        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index += 1;
        }
        return value.toFixed(value >= 10 || index === 0 ? 0 : 1) + ' ' + units[index];
    }

    function setBulkFeedback(message, type) {
        var feedback = $('.firstshorts-bulk-feedback');
        if (!feedback.length) {
            return;
        }
        if (!message) {
            feedback.text('').removeClass('is-error is-warning is-success');
            return;
        }
        feedback
            .text(message)
            .removeClass('is-error is-warning is-success')
            .addClass(type ? 'is-' + type : '');
    }

    function syncBulkHidden() {
        var ids = bulkItems.map(function (item) {
            return item.id;
        });
        $('#firstshorts_bulk_video_ids').val(ids.join(','));
    }

    function updateBulkSummary() {
        var count = bulkItems.length;
        var totalBytes = bulkItems.reduce(function (sum, item) {
            return sum + (item.bytes || 0);
        }, 0);
        $('.firstshorts-bulk-count').text(count + (count === 1 ? ' video' : ' videos'));
        $('.firstshorts-bulk-size').text(formatBytes(totalBytes));
    }

    function updateBulkActions() {
        var hasItems = bulkItems.length > 0;
        var hasSelected = bulkItems.some(function (item) {
            return item.selected;
        });
        $('.firstshorts-bulk-select-all').prop('disabled', !hasItems);
        $('.firstshorts-bulk-remove-selected').prop('disabled', !hasSelected);
        $('.firstshorts-bulk-clear').prop('disabled', !hasItems);
    }

    function renderBulkList() {
        var list = $('.firstshorts-bulk-list');
        if (!list.length) {
            return;
        }
        list.empty();
        if (!bulkItems.length) {
            list.addClass('is-empty');
            list.append($('<li class="firstshorts-bulk-empty">No videos selected yet.</li>'));
        } else {
            list.removeClass('is-empty');
        }

        bulkItems.forEach(function (item) {
            var row = $('<li class="firstshorts-bulk-item"></li>');
            var checkbox = $('<input type="checkbox" class="firstshorts-bulk-select" />');
            checkbox.prop('checked', !!item.selected);
            checkbox.data('id', item.id);

            var preview = $('<div class="firstshorts-bulk-preview"></div>');
            if (item.icon) {
                preview.append($('<img>').attr('src', item.icon).attr('alt', 'Video'));
            } else {
                preview.append($('<span class="firstshorts-bulk-fallback">VIDEO</span>'));
            }

            var meta = $('<div class="firstshorts-bulk-meta"></div>');
            meta.append($('<div class="firstshorts-bulk-title"></div>').text(item.label));
            var details = [];
            if (item.filename) {
                details.push(item.filename);
            }
            if (item.sizeLabel) {
                details.push(item.sizeLabel);
            }
            if (item.typeLabel) {
                details.push(item.typeLabel);
            }
            if (details.length) {
                meta.append($('<div class="firstshorts-bulk-details"></div>').text(details.join(' • ')));
            }

            var removeBtn = $('<button type="button" class="button-link firstshorts-bulk-remove">Remove</button>');
            removeBtn.data('id', item.id);

            row.append(checkbox, preview, meta, removeBtn);
            list.append(row);
        });

        updateBulkSummary();
        updateBulkActions();
        syncBulkHidden();
        $(document).trigger('firstshorts:bulk-updated');
    }

    function addBulkItemsFromSelection(selection) {
        var added = 0;
        var duplicates = 0;
        var rejected = 0;

        selection.each(function (attachment) {
            var data = attachment.toJSON();
            if (!data || !data.id) {
                return;
            }
            if (bulkItems.some(function (item) { return item.id === data.id; })) {
                duplicates += 1;
                return;
            }
            if (!data.mime || data.mime.indexOf('video/') !== 0) {
                rejected += 1;
                return;
            }

            bulkItems.push({
                id: data.id,
                label: data.title || data.filename || ('Video ' + data.id),
                filename: data.filename || '',
                url: data.url || '', // proper video URL
                icon: data.icon || '',
                bytes: data.filesizeInBytes || 0,
                sizeLabel: data.filesizeHumanReadable || '',
                typeLabel: data.subtype ? data.subtype.toUpperCase() : 'VIDEO',
                selected: false
            });
            added += 1;
        });

        if (added || duplicates || rejected) {
            var parts = [];
            if (added) {
                parts.push(added + ' added');
            }
            if (duplicates) {
                parts.push(duplicates + ' duplicate');
            }
            if (rejected) {
                parts.push(rejected + ' unsupported');
            }
            setBulkFeedback(parts.join(' · '), rejected ? 'warning' : 'success');
        }
    }

    var initialBulkIds = $('#firstshorts_bulk_video_ids').val();
    if (initialBulkIds) {
        var initIds = initialBulkIds.split(',').map(function (id) {
            return parseInt(id, 10);
        }).filter(function (id) {
            return id;
        });
        if (initIds.length) {
            bulkItems = initIds.map(function (id) {
                return {
                    id: id,
                    label: 'Video ID ' + id, // Placeholder until fetched
                    filename: 'Loading...',
                    url: '',
                    icon: '',
                    bytes: 0,
                    sizeLabel: '--',
                    typeLabel: 'VIDEO',
                    selected: false
                };
            });

            // Fetch actual details for each video
            initIds.forEach(function (id) {
                $.ajax({
                    url: firstshortsAdmin.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'firstshorts_get_video_details',
                        id: id,
                        nonce: firstshortsAdmin.nonce
                    },
                    success: function (response) {
                        if (response.success && response.data) {
                            var item = bulkItems.find(function (i) { return i.id === response.data.id; });
                            if (item) {
                                item.label = response.data.label || item.label;
                                item.filename = response.data.filename;
                                item.url = response.data.url;
                                item.icon = response.data.icon;
                                item.bytes = response.data.bytes;
                                item.sizeLabel = response.data.sizeLabel;
                                // Re-render to show updated details
                                renderBulkList();
                                // Update preview if this is the first item
                                if (bulkItems.indexOf(item) === 0) {
                                    updatePreview();
                                }
                            }
                        }
                    }
                });
            });

            setBulkFeedback('Loaded ' + initIds.length + ' saved videos.', 'success');
        }
    }
    // --- Helper Functions (Hoisted) ---

    function toggleVideoUrlError(show) {
        var field = $('#firstshorts_video_url');
        var error = field.closest('.firstshorts-meta-field').find('.firstshorts-inline-error');
        if (!error.length) return;
        error.toggle(!!show);
    }

    function updateShortcodePreview() {
        var type = $('#firstshorts_display_type').val();
        var grid = $('.firstshorts-shortcode-grid');
        if (!grid.length) return;
        grid.attr('data-display-type', type || '');
        grid.find('.firstshorts-shortcode-item').addClass('is-hidden');
        if (type) {
            grid.find('.firstshorts-shortcode-item[data-shortcode-type="' + type + '"]').removeClass('is-hidden');
        }
    }

    function updatePreview() {
        var previewContentBox = $('.firstshorts-admin-preview-wrapper');
        // If wrapper not found (maybe legacy), try the container directly
        if (!previewContentBox.length) previewContentBox = $('.firstshorts-preview-video-container').parent();

        var container = previewContentBox.find('.firstshorts-preview-video-container');
        var previewEmpty = previewContentBox.find('.firstshorts-preview-empty');

        // Fallback if structure is different
        if (!container.length) container = $('.firstshorts-preview-video-container');
        if (!previewEmpty.length) previewEmpty = $('.firstshorts-preview-empty');

        if (!container.length) return;

        var videoUrls = [];
        var manualUrl = $('#firstshorts_video_url').val() ? $('#firstshorts_video_url').val().trim() : '';
        if (manualUrl) {
            videoUrls.push(manualUrl);
        } else {
            bulkItems.forEach(function (item) {
                if (item.url) videoUrls.push(item.url);
            });
        }

        if (videoUrls.length === 0) {
            container.hide();
            if (previewEmpty.length) previewEmpty.show();
            return;
        }

        if (previewEmpty.length) previewEmpty.hide();
        container.show();

        var sliderProps = {
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            height: '100%',
            width: '100%',
            scrollbarWidth: 'none'
        };

        var sliderWrapper = container.find('.firstshorts-preview-slider');
        if (!sliderWrapper.length) {
            // Remove legacy video tag if present
            container.find('.firstshorts-preview-video').remove();

            sliderWrapper = $('<div class="firstshorts-preview-slider"></div>');
            sliderWrapper.css(sliderProps);
            var style = $('<style>.firstshorts-preview-slider::-webkit-scrollbar { display: none; }</style>');
            container.append(style, sliderWrapper);
            var overlay = container.find('.firstshorts-preview-overlay');
            if (overlay.length) container.append(overlay);
        }

        sliderWrapper.empty();

        videoUrls.forEach(function (url) {
            var slide = $('<div class="firstshorts-preview-slide"></div>');
            slide.css({
                minWidth: '100%',
                scrollSnapAlign: 'start',
                height: '100%',
                position: 'relative',
                backgroundColor: '#000'
            });
            var video = $('<video playsinline loop muted></video>');
            video.attr('src', url);
            video.css({ width: '100%', height: '100%', objectFit: 'cover' });
            video.on('click', function () {
                if (this.paused) this.play(); else this.pause();
            });
            slide.append(video);
            sliderWrapper.append(slide);
        });
    }

    function updateSaveState() {
        var videoUrlField = $('#firstshorts_video_url');
        var hasVideoInput = videoUrlField.val() && videoUrlField.val().trim() !== '';
        var hasBulkSelection = bulkItems.length > 0;
        var hasVideo = hasVideoInput || hasBulkSelection;

        // Visual feedback
        var actions = $('.firstshorts-main-actions');
        var hint = actions.find('.firstshorts-save-hint');

        if (!hasVideo) {
            hint.text('Select at least one video or enter a URL');
        } else {
            hint.text('Ready to save settings');
        }
        toggleVideoUrlError(!hasVideo);
    }

    function initFirstshortsAdminLayout() {
        if ($('.firstshorts-admin-main-box').length) {
            return;
        }

        // Meta box shells
        var displayBox = $('#firstshorts_video_display_options');
        var detailsBox = $('#firstshorts_video_details');
        var thumbnailBox = $('#postimagediv');
        var previewBox = $('#firstshorts_video_preview');
        var shortcodeBox = $('#firstshorts_video_shortcodes');

        if (!displayBox.length || !detailsBox.length) {
            return;
        }

        // Create Builder Layout
        var mainWrapper = $('<div class="firstshorts-admin-main-box firstshorts-builder"></div>');
        var builderLayout = $('<div class="firstshorts-builder-layout"></div>');

        var leftPanel = $(
            '<section class="firstshorts-panel firstshorts-panel-library">' +
            '<div class="firstshorts-panel-header">' +
            '<div class="firstshorts-panel-header-content">' +
            '<h3>Video Library</h3>' +
            '<p>Choose videos from your media library</p>' +
            '</div>' +
            '<button type="button" id="firstshorts_bulk_upload_btn" class="button firstshorts-upload-btn">Add Video</button>' +
            '</div>' +
            '<div class="firstshorts-panel-body"></div>' +
            '</section>'
        );

        var centerPanel = $(
            '<section class="firstshorts-panel firstshorts-panel-preview">' +
            '<div class="firstshorts-panel-header">' +
            '<div class="firstshorts-panel-header-content">' +
            '<h3>Preview & Shortcode</h3>' +
            '<p>Preview your video slider and copy shortcode</p>' +
            '</div>' +
            '<div class="firstshorts-panel-actions">' +
            '<button type="button" class="firstshorts-device-btn is-active">Desktop</button>' +
            '<button type="button" class="firstshorts-device-btn">Tablet</button>' +
            '<button type="button" class="firstshorts-device-btn">Mobile</button>' +
            '</div>' +
            '</div>' +
            '<div class="firstshorts-panel-body firstshorts-admin-preview-wrapper"></div>' +
            '</section>'
        );

        var rightPanel = $(
            '<section class="firstshorts-panel firstshorts-panel-settings">' +
            '<div class="firstshorts-panel-header">' +
            '<div class="firstshorts-panel-header-content">' +
            '<h3>Settings</h3>' +
            '<p>Configure display options and appearance</p>' +
            '</div>' +
            '</div>' +
            '<div class="firstshorts-panel-body"></div>' +
            '</section>'
        );

        var actions = $(
            '<div class="firstshorts-main-actions">' +
            '<span class="firstshorts-save-hint">Ready to save settings</span>' +
            '<button type="button" class="button button-primary firstshorts-save-btn">Save Short</button>' +
            '</div>'
        );

        builderLayout.append(leftPanel, centerPanel, rightPanel);
        mainWrapper.append(builderLayout);

        // Inject inside form
        $('#titlediv').after(mainWrapper);

        // --- Move CONTENT ---

        // Left Content
        var detailsContent = detailsBox.find('.inside').children();
        if (detailsContent.length) {
            leftPanel.find('.firstshorts-panel-body').append(detailsContent);
            // Hide duplicate button inside content
            leftPanel.find('#firstshorts_bulk_upload_btn').not('.firstshorts-upload-btn').closest('.firstshorts-video-actions').hide();
        }
        detailsBox.hide();

        if (thumbnailBox.length) {
            var thumbContent = thumbnailBox.find('.inside').children();
            if (thumbContent.length) {
                var thumbWrapper = $('<div class="firstshorts-thumbnail-wrapper"><h3>Thumbnail</h3></div>');
                thumbWrapper.append(thumbContent);
                leftPanel.find('.firstshorts-panel-body').append(thumbWrapper);
            }
            thumbnailBox.hide();
        }

        // Center Content
        if (shortcodeBox.length) {
            centerPanel.find('.firstshorts-panel-body').append(shortcodeBox.find('.inside').children());
            shortcodeBox.hide();
        }

        if (previewBox.length) {
            centerPanel.find('.firstshorts-panel-body').append(previewBox.find('.inside').children());
            previewBox.hide();
        }

        // Right Content
        if (displayBox.length) {
            rightPanel.find('.firstshorts-panel-body').append(displayBox.find('.inside').children());
            rightPanel.find('.firstshorts-panel-body').append(actions);
            displayBox.hide();
        }

        $('.firstshorts-meta-row').remove();

        var editorWrapper = $('#postdivrich');
        if (editorWrapper.length) {
            mainWrapper.after(editorWrapper);
        }

        // --- Init Functionality ---
        updateSaveState();
        updatePreview();
        updateShortcodePreview();

        // Bind Events
        $(document).on('input', '#firstshorts_video_url', function () {
            updateSaveState();
            updatePreview();
        });
        $(document).on('change', '#firstshorts_display_type', function () {
            updateSaveState();
            updateShortcodePreview();
        });
        $(document).on('change input', '.firstshorts-panel-settings input, .firstshorts-panel-settings select', updateSaveState);
        $(document).on('firstshorts:bulk-updated', function () {
            updateSaveState();
            updatePreview();
        });

        // Save Button
        mainWrapper.on('click', '.firstshorts-save-btn', function () {
            // Validation
            var videoUrlField = $('#firstshorts_video_url');
            var hasVideo = videoUrlField.val() || bulkItems.length > 0;

            if (!hasVideo) {
                toggleVideoUrlError(true);
                videoUrlField.trigger('focus');
                return;
            }

            $(window).off('beforeunload');
            if (window.onbeforeunload) window.onbeforeunload = null;
            $('#post_status').val('draft');
            $('#original_post_status').val('draft');

            var saveBtn = $('#save-post');
            if (saveBtn.length) {
                saveBtn.trigger('click');
            } else {
                $('#post').trigger('submit');
            }
        });
    }

    // --- Global Event Listeners ---

    // Bulk upload button
    $(document).on('click', '#firstshorts_bulk_upload_btn', function (e) {
        e.preventDefault();

        if (bulkFrame) {
            bulkFrame.open();
            return;
        }

        bulkFrame = wp.media({
            title: firstshortsAdmin.uploadTitle,
            button: { text: firstshortsAdmin.uploadButton },
            library: { type: firstshortsAdmin.allowedTypes || ['video'] },
            multiple: true
        });

        bulkFrame.on('select', function () {
            var selection = bulkFrame.state().get('selection');
            addBulkItemsFromSelection(selection);
            renderBulkList();
        });

        bulkFrame.open();
    });

    $(document).on('change', '.firstshorts-bulk-select', function () {
        var id = $(this).data('id');
        var item = bulkItems.find(function (entry) { return entry.id === id; });
        if (item) {
            item.selected = $(this).is(':checked');
        }
        updateBulkActions();
    });

    $(document).on('click', '.firstshorts-bulk-select-all', function (e) {
        e.preventDefault();
        bulkItems.forEach(function (item) { item.selected = true; });
        renderBulkList();
    });

    $(document).on('click', '.firstshorts-bulk-remove-selected', function (e) {
        e.preventDefault();
        bulkItems = bulkItems.filter(function (item) { return !item.selected; });
        renderBulkList();
        setBulkFeedback('Selected videos removed.', 'success');
    });

    $(document).on('click', '.firstshorts-bulk-clear', function (e) {
        e.preventDefault();
        bulkItems = [];
        renderBulkList();
        setBulkFeedback('Selection cleared.', 'success');
    });

    $(document).on('click', '.firstshorts-bulk-remove', function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        bulkItems = bulkItems.filter(function (item) { return item.id !== id; });
        renderBulkList();
        setBulkFeedback('Video removed.', 'success');
    });

    // Initialize
    renderBulkList();
    initFirstshortsAdminLayout();
    document.body.classList.remove('firstshorts-admin-loading');

    // Copy shortcode button
    $(document).on('click', '.firstshorts-copy-btn', function (e) {
        e.preventDefault();
        var button = $(this);
        var textToCopy = button.data('copy') || '';

        if (!textToCopy) {
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function () {
                showCopied(button);
            });
        } else {
            // Fallback for older browsers
            var tempInput = $('<input>');
            $('body').append(tempInput);
            tempInput.val(textToCopy).select();
            document.execCommand('copy');
            tempInput.remove();
            showCopied(button);
        }
    });

    function showCopied(button) {
        var originalText = button.text();
        button.text('Copied');
        button.addClass('is-copied');
        setTimeout(function () {
            button.text(originalText);
            button.removeClass('is-copied');
        }, 1500);
    }
});
