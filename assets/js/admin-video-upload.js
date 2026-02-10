jQuery(document).ready(function ($) {
    var mediaFrame;
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
        $('.firstshorts-bulk-count').text(count + (count === 1 ? ' video selected' : ' videos selected'));
        $('.firstshorts-bulk-size').text('Total size: ' + formatBytes(totalBytes));
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
                    label: 'Video ID ' + id,
                    filename: '',
                    icon: '',
                    bytes: 0,
                    sizeLabel: '',
                    typeLabel: 'VIDEO',
                    selected: false
                };
            });
            setBulkFeedback('Loaded previous selections. Save to refresh details.', 'warning');
        }
    }

    function initFirstshortsAdminLayout() {
        if ($('.firstshorts-admin-main-box').length) {
            return;
        }
        var displayBox = $('#firstshorts_video_display_options');
        var detailsBox = $('#firstshorts_video_details');
        var thumbnailBox = $('#postimagediv');
        var previewBox = $('#firstshorts_video_preview');
        var shortcodeBox = $('#firstshorts_video_shortcodes');

        if (!displayBox.length || !detailsBox.length) {
            return;
        }

        var mainWrapper = $('<div class="firstshorts-admin-main-box"></div>');
        var splitWrapper = $('<div class="firstshorts-split-layout"></div>');
        var tabsWrapper = $('<div class="firstshorts-tabs"></div>');
        var tabsNav = $(
            '<div class="firstshorts-tabs-nav">' +
                '<button type="button" class="firstshorts-tab is-active" data-tab="details">Video Details</button>' +
                '<button type="button" class="firstshorts-tab" data-tab="display">Display Options</button>' +
            '</div>'
        );
        var tabsBody = $('<div class="firstshorts-tabs-body"></div>');
        var displayPanel = $('<div class="firstshorts-tab-panel" data-tab-panel="display"></div>');
        var detailsPanel = $('<div class="firstshorts-tab-panel is-active" data-tab-panel="details"></div>');
        var actions = $(
            '<div class="firstshorts-main-actions">' +
                '<span class="firstshorts-save-hint">Make changes to enable save</span>' +
                '<button type="button" class="button button-primary firstshorts-save-btn">Save Short</button>' +
            '</div>'
        );

        displayBox.before(mainWrapper);
        if (shortcodeBox.length) {
            mainWrapper.append(shortcodeBox);
        }
        mainWrapper.append(splitWrapper);
        displayPanel.append(displayBox);
        detailsPanel.append(detailsBox);
        tabsBody.append(displayPanel).append(detailsPanel);
        tabsWrapper.append(tabsNav).append(tabsBody);
        splitWrapper.append(tabsWrapper);
        if (previewBox.length) {
            splitWrapper.append(previewBox);
        }
        mainWrapper.append(actions);

        if (thumbnailBox.length) {
            var metaRow = $('<div class="firstshorts-meta-row"></div>');
            mainWrapper.after(metaRow);
            metaRow.append(thumbnailBox);
        }

        // Move editor below the meta row
        var editorWrapper = $('#postdivrich');
        if (editorWrapper.length) {
            var metaRowCheck = $('.firstshorts-meta-row');
            if (metaRowCheck.length) {
                metaRowCheck.after(editorWrapper);
            } else {
                mainWrapper.after(editorWrapper);
            }
        }

        var saveBtn = $('#save-post');
        var videoUrlField = $('#firstshorts_video_url');
        var displayTypeField = $('#firstshorts_display_type');
        var displayCheckboxes = displayBox.find('input[type="checkbox"]');
        var videoDurationField = $('#firstshorts_video_duration');
        var maxWidthField = $('#firstshorts_video_max_width');
        var initialDisplayState = {};
        displayCheckboxes.each(function () {
            initialDisplayState[this.id] = this.checked ? '1' : '0';
        });
        var initialDisplayType = displayTypeField.val();
        var initialVideoUrl = videoUrlField.val();
        var initialVideoDuration = videoDurationField.val();
        var initialMaxWidth = maxWidthField.val();

        function toggleVideoUrlError(show) {
            var error = videoUrlField.closest('.firstshorts-meta-field').find('.firstshorts-inline-error');
            if (!error.length) {
                return;
            }
            error.toggle(!!show);
        }

        function updateSaveState() {
            var hasVideo = videoUrlField.val().trim() !== '';
            var hasDisplayChange = false;
            displayCheckboxes.each(function () {
                if ((this.checked ? '1' : '0') !== initialDisplayState[this.id]) {
                    hasDisplayChange = true;
                }
            });
            if (displayTypeField.val() !== initialDisplayType) {
                hasDisplayChange = true;
            }

            var hasVideoDetailsChange = false;
            if (videoUrlField.val() !== initialVideoUrl) {
                hasVideoDetailsChange = true;
            }
            if (videoDurationField.val() !== initialVideoDuration) {
                hasVideoDetailsChange = true;
            }
            if (maxWidthField.val() !== initialMaxWidth) {
                hasVideoDetailsChange = true;
            }

            var hint = actions.find('.firstshorts-save-hint');
            if (!hasVideo) {
                hint.text('Video URL is required');
            } else if (!hasDisplayChange && !hasVideoDetailsChange) {
                hint.text('Change at least one setting');
            } else {
                hint.text('Ready to save settings');
            }
            toggleVideoUrlError(!hasVideo);
        }


        function updateShortcodePreview() {
            var type = displayTypeField.val();
            var grid = $('.firstshorts-shortcode-grid');
            if (!grid.length) {
                return;
            }
            grid.attr('data-display-type', type || '');
            grid.find('.firstshorts-shortcode-item').addClass('is-hidden');
            if (type) {
                grid
                    .find('.firstshorts-shortcode-item[data-shortcode-type="' + type + '"]')
                    .removeClass('is-hidden');
            }
        }

        function updatePreview() {
            if (!previewBox.length) {
                return;
            }
            var previewVideo = previewBox.find('.firstshorts-preview-video');
            var previewEmpty = previewBox.find('.firstshorts-preview-empty');
            var url = videoUrlField.val().trim();
            if (!url) {
                previewVideo.attr('src', '').hide();
                previewEmpty.show();
                return;
            }
            previewVideo.attr('src', url).show();
            previewEmpty.hide();
        }

        function showFirstshortsToast(message) {
            var toast = $('#firstshorts-admin-toast');
            if (!toast.length) {
                toast = $('<div id="firstshorts-admin-toast" class="firstshorts-admin-toast"></div>');
                $('body').append(toast);
            }
            toast.text(message).addClass('is-visible');
            clearTimeout(toast.data('timeoutId'));
            var timeoutId = setTimeout(function () {
                toast.removeClass('is-visible');
            }, 2200);
            toast.data('timeoutId', timeoutId);
        }

        updateSaveState();
        updatePreview();
        updateShortcodePreview();

        videoUrlField.on('input', function () {
            updateSaveState();
            updatePreview();
        });
        displayTypeField.on('change', function () {
            updateSaveState();
            updateShortcodePreview();
        });
        displayCheckboxes.on('change', updateSaveState);
        videoDurationField.on('input', updateSaveState);
        maxWidthField.on('input', updateSaveState);

        tabsWrapper.on('click', '.firstshorts-tab', function () {
            var target = $(this).data('tab');
            tabsWrapper.find('.firstshorts-tab').removeClass('is-active');
            $(this).addClass('is-active');
            tabsWrapper.find('.firstshorts-tab-panel').removeClass('is-active');
            tabsWrapper.find('.firstshorts-tab-panel').filter(function () {
                return $(this).data('tab-panel') === target;
            }).addClass('is-active');
        });

        // Save Settings always keeps draft status
        mainWrapper.on('click', '.firstshorts-save-btn', function () {
            var hasVideo = videoUrlField.val().trim() !== '';
            var hasDisplayChange = false;
            displayCheckboxes.each(function () {
                if ((this.checked ? '1' : '0') !== initialDisplayState[this.id]) {
                    hasDisplayChange = true;
                }
            });
            if (displayTypeField.val() !== initialDisplayType) {
                hasDisplayChange = true;
            }

            var hasVideoDetailsChange = false;
            if (videoUrlField.val() !== initialVideoUrl) {
                hasVideoDetailsChange = true;
            }
            if (videoDurationField.val() !== initialVideoDuration) {
                hasVideoDetailsChange = true;
            }
            if (maxWidthField.val() !== initialMaxWidth) {
                hasVideoDetailsChange = true;
            }

            if (!hasVideo) {
                toggleVideoUrlError(true);
                videoUrlField.trigger('focus');
                return;
            }

            if (!hasDisplayChange && !hasVideoDetailsChange) {
                showFirstshortsToast('Please change at least one setting before saving.');
                return;
            }

            $(window).off('beforeunload');
            if (window.onbeforeunload) {
                window.onbeforeunload = null;
            }
            $('#post_status').val('draft');
            $('#original_post_status').val('draft');
            if (saveBtn.length) {
                saveBtn.trigger('click');
            } else {
                $('#post').trigger('submit');
            }
        });
    }

    // Video upload button
    $(document).on('click', '#firstshorts_upload_video_btn', function (e) {
        e.preventDefault();

        if (mediaFrame) {
            mediaFrame.open();
            return;
        }

        mediaFrame = wp.media({
            title: firstshortsAdmin.uploadTitle,
            button: { text: firstshortsAdmin.uploadButton },
            library: { type: firstshortsAdmin.allowedTypes || ['video'] },
            multiple: false
        });

        mediaFrame.on('select', function () {
            var attachment = mediaFrame.state().get('selection').first().toJSON();
            if (attachment && attachment.url) {
                $('#firstshorts_video_url').val(attachment.url).trigger('input');
            }
        });

        mediaFrame.open();
    });

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

    renderBulkList();
    initFirstshortsAdminLayout();

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
