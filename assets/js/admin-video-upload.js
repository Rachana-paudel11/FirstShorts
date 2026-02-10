jQuery(document).ready(function ($) {
    var mediaFrame;
    var bulkFrame;

    function renderBulkList(ids, labels) {
        var list = $('.firstshorts-bulk-list');
        if (!list.length) {
            return;
        }
        list.empty();
        if (!ids || !ids.length) {
            return;
        }
        ids.forEach(function (id, index) {
            var label = labels && labels[index] ? labels[index] : ('Video ID ' + id);
            list.append($('<li>').text(label));
        });
    }

    var initialBulkIds = $('#firstshorts_bulk_video_ids').val();
    if (initialBulkIds) {
        var initIds = initialBulkIds.split(',').map(function (id) {
            return parseInt(id, 10);
        }).filter(function (id) {
            return id;
        });
        renderBulkList(initIds);
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
                '<button type="button" class="button button-primary firstshorts-save-btn">Save Settings</button>' +
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
            var ids = [];
            var labels = [];
            selection.each(function (attachment) {
                var data = attachment.toJSON();
                if (!data || !data.id) {
                    return;
                }
                ids.push(data.id);
                labels.push(data.filename || data.title || ('Video ID ' + data.id));
            });

            $('#firstshorts_bulk_video_ids').val(ids.join(','));
            renderBulkList(ids, labels);
        });

        bulkFrame.open();
    });

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
