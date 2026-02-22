jQuery(document).ready(function ($) {
    var bulkFrame;
    var bulkItems = [];

    var ICONS = {
        DRAG: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle></svg>',
        BUY: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        SHARE: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        PREV_V: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>',
        NEXT_V: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
        PREV_H: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
        NEXT_H: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
        INFO: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        FIT: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>',
        COPY: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
    };

    // Helper to prevent expensive functions from running too often
    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }

    var debouncedUpdatePreview = debounce(updatePreview, 250);

    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return ' --';
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
        var selectedItems = bulkItems.filter(function (item) { return item.selected; });
        var ids = selectedItems.map(function (item) { return item.id; });
        $('#firstshorts_bulk_video_ids').val(ids.join(','));

        // Save metadata (like description) per video
        var bulkData = {};
        selectedItems.forEach(function (item) {
            bulkData[item.id] = { description: item.description || '' };
        });
        $('#firstshorts_bulk_video_data').val(JSON.stringify(bulkData));
    }

    function updateBulkSummary() {
        var count = bulkItems.length;
        $('.firstshorts-bulk-count').text(count);

        var totalSeconds = 0;
        bulkItems.forEach(function (item) {
            if (item.bytes) {
                // If it's a real item, maybe we have duration?
                // For now let's just show count, but we can add more stats later
            }
        });
    }

    function updateBulkActions() {
        var hasItems = bulkItems.length > 0;
        $('.firstshorts-bulk-clear').prop('disabled', !hasItems);
    }

    function renderBulkList() {
        var list = $('.firstshorts-bulk-list');
        if (!list.length) return;

        list.empty();
        if (!bulkItems.length) {
            list.addClass('is-empty').append($('<li class="firstshorts-bulk-empty">No videos selected yet.</li>'));
        } else {
            list.removeClass('is-empty');
        }

        bulkItems.forEach(function (item) {
            var row = $('<li class="firstshorts-bulk-item"></li>').data('id', item.id);
            if (item.selected) row.addClass('is-selected');

            var handle = $('<div class="firstshorts-bulk-handle" title="Drag to reorder">' + ICONS.DRAG + '</div>');

            var checkbox = $('<input type="checkbox" class="firstshorts-bulk-select" />');
            checkbox.prop('checked', !!item.selected).data('id', item.id);

            var preview = $('<div class="firstshorts-bulk-preview"></div>');
            if (item.icon) preview.append($('<img>').attr('src', item.icon));
            else preview.append($('<span class="firstshorts-bulk-fallback">VIDEO</span>'));

            var meta = $('<div class="firstshorts-bulk-meta"></div>');
            meta.append($('<div class="firstshorts-bulk-title"></div>').text(item.label));
            var details = [];
            if (item.filename) {
                details.push(item.filename);
            }
            if (item.sizeLabel) {
                details.push('Size: ' + item.sizeLabel);
            }
            if (item.typeLabel) {
                details.push(item.typeLabel);
            }
            if (details.length) {
                meta.append($('<div class="firstshorts-bulk-details"></div>').text(details.join(' • ')));
            }

            var removeBtn = $('<button type="button" class="button-link firstshorts-bulk-remove">Remove</button>').data('id', item.id);

            // Add description field
            var descWrapper = $('<div class="firstshorts-bulk-desc-row"></div>');
            var descInput = $('<textarea class="firstshorts-bulk-desc-input" placeholder="Add description..."></textarea>');
            descInput.val(item.description || '').on('input', function () {
                item.description = $(this).val();
                syncBulkHidden();
            });
            descWrapper.append(descInput);

            row.append(handle, checkbox, preview, meta, removeBtn, descWrapper);
            list.append(row);
        });

        // Initialize sorting
        if (list.hasClass('ui-sortable')) {
            list.sortable('destroy');
        }

        if (bulkItems.length > 1) {
            list.sortable({
                handle: '.firstshorts-bulk-handle',
                placeholder: 'firstshorts-bulk-placeholder',
                axis: 'y',
                update: function () {
                    var newOrder = [];
                    list.children('.firstshorts-bulk-item').each(function () {
                        var id = $(this).data('id');
                        var item = bulkItems.find(function (i) { return i.id == id; });
                        if (item) newOrder.push(item);
                    });
                    bulkItems = newOrder;
                    syncBulkHidden();
                    updatePreview();
                    updateSaveState();
                }
            });
        }

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
                url: data.url || attachment.get('url') || '', // try both
                icon: data.icon || '',
                bytes: data.filesizeInBytes || 0,
                sizeLabel: data.filesizeHumanReadable || formatBytes(data.filesizeInBytes),
                typeLabel: data.subtype ? data.subtype.toUpperCase() : 'VIDEO',
                selected: true
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

            if (parts.length) {
                setBulkFeedback(parts.join(' · '), rejected ? 'warning' : 'success');
            }
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
            var bulkDataRaw = $('#firstshorts_bulk_video_data').val();
            var bulkData = {};
            try {
                if (bulkDataRaw) bulkData = JSON.parse(bulkDataRaw);
            } catch (e) { console.error('Failed to parse bulk data', e); }

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
                    selected: true,
                    description: (bulkData[id] && bulkData[id].description) ? bulkData[id].description : ''
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
                                // Refresh preview for every item as it loads
                                updatePreview();
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
        var grid = $('.firstshorts-shortcode-grid');
        if (!grid.length) return;

        var ids = bulkItems
            .filter(function (item) { return item.selected; })
            .map(function (item) { return item.id; });

        var shortcode = '[fs_slider';
        var postId = (typeof firstshortsAdmin !== 'undefined' && firstshortsAdmin.postId) ? firstshortsAdmin.postId : 0;

        if (postId) {
            shortcode += ' id="' + postId + '"';
        } else {
            // Fallback for new posts where ID might not be stable or known yet, though typically it is.
            // If we really need ids for unsaved posts, we can keep using ids, but the user requested short code.
            // But usually WP creates auto-draft ID.
            if (ids.length) {
                shortcode += ' ids="' + ids.join(',') + '"';
                shortcode += ' count="' + ids.length + '"';
            } else {
                shortcode += ' count="5"';
            }
        }
        shortcode += ']';

        var input = grid.find('.firstshorts-shortcode-input');
        var copyBtn = grid.find('.firstshorts-copy-btn');

        if (input.length) input.val(shortcode);
        if (copyBtn.length) copyBtn.attr('data-copy', shortcode);

        // Always show the slider item since we removed the type toggle
        grid.find('.firstshorts-shortcode-item').removeClass('is-hidden');
    }

    function updatePreview() {
        var previewContentBox = $('.firstshorts-preview-content-area');
        // If wrapper not found (maybe legacy), try the container directly
        if (!previewContentBox.length) previewContentBox = $('.firstshorts-preview-video-container').parent();

        var container = previewContentBox.find('.firstshorts-preview-video-container');
        var previewEmpty = previewContentBox.find('.firstshorts-preview-empty');

        // Apply Card Width & Height
        var manualWidth = $('#firstshorts_video_max_width').val() || 500;
        var manualHeight = $('#firstshorts_video_max_height').val() || 630;
        var isFitMode = $('.firstshorts-fit-btn').hasClass('is-active');

        // Add dimension badge to container if it doesn't exist
        var badge = container.find('.firstshorts-dimension-badge');
        if (!badge.length) {
            badge = $('<div class="firstshorts-dimension-badge"></div>');
            container.prepend(badge);
        }
        badge.text(manualWidth + ' × ' + manualHeight + ' px');

        var availW = previewContentBox.width() - 60;
        var availH = previewContentBox.height() - 60;
        var scale = isFitMode ? Math.min(availW / manualWidth, availH / manualHeight, 1) : 1;

        var panelBody = previewContentBox.closest('.firstshorts-panel-body');
        panelBody.css({
            'overflow': isFitMode ? 'hidden' : 'auto',
            'align-items': isFitMode ? 'center' : 'flex-start'
        });

        previewContentBox.css({
            'max-width': '100%',
            'height': isFitMode ? '100%' : 'auto',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        });

        if (container.length) {
            container.css({
                'width': manualWidth + 'px',
                'height': manualHeight + 'px',
                'transform': 'scale(' + scale + ')',
                'transform-origin': 'center center',
                'flex-shrink': '0',
                'margin': isFitMode ? '0' : '60px auto'
            });
        }

        // Fallback if structure is different
        if (!container.length) container = $('.firstshorts-preview-video-container');
        if (!previewEmpty.length) previewEmpty = $('.firstshorts-preview-empty');

        if (!container.length) return;

        var items = [];
        var manualUrl = $('#firstshorts_video_url').val() ? $('#firstshorts_video_url').val().trim() : '';
        if (manualUrl) {
            items.push({
                url: manualUrl,
                description: '', // Global preview doesn't have per-video desc for manual URL
                ctaStyle: $('#firstshorts_cta_style').val() || 'primary'
            });
        } else {
            bulkItems.forEach(function (item) {
                if (item.selected && item.url) {
                    items.push({
                        url: item.url,
                        description: item.description || '',
                        ctaStyle: $('#firstshorts_cta_style').val() || 'primary' // Fallback to global style
                    });
                }
            });
        }

        if (items.length === 0) {
            container.hide();
            if (previewEmpty.length) previewEmpty.show();
            return;
        }

        if (previewEmpty.length) previewEmpty.hide();
        container.show();
        // Also show the parent wrapper if it was hidden by PHP
        $('#firstshorts-preview-player').show();

        var orientation = $('#firstshorts_slider_orientation').val() || 'horizontal';
        $('.firstshorts-panel-preview').toggleClass('is-vertical', orientation === 'vertical');

        // Scroll Snap is now forced to true by default
        var scrollSnap = true;

        var sliderProps = {
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'column' : 'row',
            overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
            overflowY: orientation === 'vertical' ? 'auto' : 'hidden',
            scrollSnapType: (orientation === 'vertical' ? 'y' : 'x') + ' mandatory', // Always mandatory
            webkitOverflowScrolling: 'touch',
            height: '100%',
            width: '100%'
        };

        var sliderWrapper = container.find('.firstshorts-preview-slider');
        if (!sliderWrapper.length) {
            // Remove legacy video tag if present
            container.find('.firstshorts-preview-video').remove();

            sliderWrapper = $('<div class="firstshorts-preview-slider"></div>');
            container.append(sliderWrapper);
            var overlay = container.find('.firstshorts-preview-overlay');
            if (overlay.length) container.append(overlay);
        }

        // Always re-apply these styles (handles orientation changes too)
        sliderWrapper.css($.extend({}, sliderProps, {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%'
        }));

        sliderWrapper.empty();

        var showBuy = $('#firstshorts_show_buy_button').is(':checked');
        var ctaText = $('#firstshorts_cta_text').val() || 'Buy Now';

        items.forEach(function (item) {
            var slide = $('<div class="firstshorts-preview-slide"></div>').css({
                minWidth: '100%',
                scrollSnapAlign: 'start',
                height: orientation === 'vertical' ? '100%' : '100%',
                width: '100%',
                position: 'relative',
                backgroundColor: '#000',
                overflow: 'hidden',
                flexShrink: 0
            });
            var video = $('<video playsinline loop muted controls preload="auto" style="width:100%; height:100%; object-fit:contain; background:#000;"></video>');
            video.append($('<source>').attr('src', item.url).attr('type', 'video/mp4'));
            video.on('click', function () {
                if (this.paused) this.play(); else this.pause();
            });
            slide.append(video);

            var metaContainer = $('<div class="firstshorts-slide-meta"></div>');
            metaContainer.css('pointer-events', 'auto');

            // Add description if exists
            if (item.description) {
                var descDiv = $('<div class="firstshorts-video-description"></div>');
                descDiv.text(item.description);
                descDiv.css({
                    color: '#fff',
                    fontSize: '13px',
                    marginBottom: '10px',
                    padding: '0 5px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    display: '-webkit-box',
                    '-webkit-line-clamp': '2',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                });
                metaContainer.append(descDiv);
            }

            if (showBuy) {
                var ctaRow = $('<div class="firstshorts-video-cta-row"></div>');
                var ctaClass = item.ctaStyle === 'secondary' ? 'firstshorts-btn-cta-secondary' : '';

                var buyBtn = $('<button type="button" class="firstshorts-btn firstshorts-btn-cta ' + ctaClass + '"></button>');
                buyBtn.html('<span class="firstshorts-btn-symbol">' + ICONS.BUY + '</span> <span class="firstshorts-btn-text">' + ctaText + '</span>');
                buyBtn.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var ctaLink = $('#firstshorts_cta_link').val();
                    if (ctaLink) {
                        window.open(ctaLink, '_blank');
                    } else {
                        alert('No CTA Link set yet.');
                    }
                });

                ctaRow.append(buyBtn);
                metaContainer.append(ctaRow);
            }
            slide.append(metaContainer);

            var showShare = $('#firstshorts_show_share').is(':checked');

            if (showShare) {
                var actionRow = $('<div class="firstshorts-preview-actions"></div>');
                actionRow.css('pointer-events', 'auto');

                var shareBtn = $('<button type="button" class="firstshorts-preview-btn firstshorts-preview-btn-overlay"><span class="firstshorts-btn-symbol">' + ICONS.SHARE + '</span></button>');
                actionRow.append(shareBtn);
                slide.append(actionRow);
            }

            sliderWrapper.append(slide);
            video[0].load();
        });

        // Show/Hide navigation arrows based on count
        var navPrev = $('.firstshorts-panel-preview').find('#firstshorts-preview-nav-prev');
        var navNext = $('.firstshorts-panel-preview').find('#firstshorts-preview-nav-next');

        if (items.length > 1) {
            navPrev.css('display', 'flex');
            navNext.css('display', 'flex');

            // Update icons based on orientation
            if (orientation === 'vertical') {
                navPrev.html(ICONS.PREV_V);
                navNext.html(ICONS.NEXT_V);
            } else {
                navPrev.html(ICONS.PREV_H);
                navNext.html(ICONS.NEXT_H);
            }
        } else {
            navPrev.hide();
            navNext.hide();
        }

        // Sync videos on first render
        setTimeout(syncPreviewVideos, 100);

        // Add scroll listener for manual swiping/scrolling
        sliderWrapper.off('scroll.firstshorts').on('scroll.firstshorts', function () {
            // Immediately pause all videos to avoid sound overlap during fast scrolling
            $(this).find('video').each(function () { this.pause(); });
            debouncedSync();
        });

        var debouncedSync = debounce(syncPreviewVideos, 200);
    }

    /**
     * Smart Audio/Video Management
     * Pauses all videos except the one currently in the center of the viewport
     */
    function syncPreviewVideos() {
        var slider = $('.firstshorts-preview-slider');
        if (!slider.length) return;

        var sliderRect = slider[0].getBoundingClientRect();
        var orientation = $('#firstshorts_slider_orientation').val() || 'horizontal';
        var centerX = sliderRect.left + sliderRect.width / 2;
        var centerY = sliderRect.top + sliderRect.height / 2;

        slider.find('.firstshorts-preview-slide').each(function () {
            var slide = $(this);
            var video = slide.find('video')[0];
            if (!video) return;

            var rect = this.getBoundingClientRect();
            var isActive = false;

            if (orientation === 'vertical') {
                isActive = (centerY >= rect.top && centerY <= rect.bottom);
            } else {
                isActive = (centerX >= rect.left && centerX <= rect.right);
            }

            if (isActive) {
                if (video.paused) {
                    video.muted = false;
                    video.play().catch(function (e) { });
                }
            } else {
                if (!video.paused) {
                    video.pause();
                    video.muted = true;
                }
            }
        });
    }

    function updateSaveState() {
        var videoUrlField = $('#firstshorts_video_url');
        var hasVideoInput = videoUrlField.val() && videoUrlField.val().trim() !== '';
        var hasBulkSelection = bulkItems.length > 0;
        var hasVideo = hasVideoInput || hasBulkSelection;

        // Visual feedback
        var actions = $('.firstshorts-save-wrapper');
        var hint = actions.find('.firstshorts-save-hint');
        var saveBtn = $('.firstshorts-save-btn-top');

        if (!hasVideo) {
            saveBtn.removeClass('has-changes');
        } else {
            saveBtn.addClass('has-changes');
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
            '<h3>Videos</h3>' +
            '<span class="firstshorts-info-trigger" data-tooltip="Manage your video library. Selected videos will appear in the slider on your site.">' + ICONS.INFO + '</span>' +
            '</div>' +
            '<div class="firstshorts-panel-actions">' +
            '<button type="button" id="firstshorts_bulk_upload_btn" class="button firstshorts-upload-btn">Add Video</button>' +
            '</div>' +
            '</div>' +
            '<div class="firstshorts-panel-body"></div>' +
            '</section>'
        );

        var centerPanel = $(
            '<section class="firstshorts-panel firstshorts-panel-settings">' +
            '<div class="firstshorts-panel-header">' +
            '<div class="firstshorts-panel-header-content">' +
            '<h3>Settings</h3>' +
            '<span class="firstshorts-info-trigger" data-tooltip="Customize how your videos look and behave on the frontend.">' + ICONS.INFO + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="firstshorts-panel-body"></div>' +
            '</section>'
        );

        var rightPanel = $(
            '<section class="firstshorts-panel firstshorts-panel-preview">' +
            '<div class="firstshorts-panel-header">' +
            '<div class="firstshorts-panel-header-content">' +
            '<h3>Live Preview</h3>' +
            '</div>' +
            '<div class="firstshorts-panel-actions">' +
            '<button type="button" class="firstshorts-fit-btn is-active" title="Toggle Scale to Fit">' +
            ICONS.FIT +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="firstshorts-panel-body">' +
            '<div class="firstshorts-preview-content-area"></div>' +
            '</div>' +
            '</section>'
        );

        var topActions = $(
            '<div class="firstshorts-top-actions">' +
            '<div class="firstshorts-top-shortcode firstshorts-shortcode-section"></div>' +
            '<div class="firstshorts-save-wrapper">' +
            '<button type="button" class="button button-primary firstshorts-save-btn firstshorts-save-btn-top">Save Short</button>' +
            '</div>' +
            '</div>'
        );

        builderLayout.append(leftPanel, centerPanel, rightPanel);
        mainWrapper.append(topActions, builderLayout);

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

        // Thumbnail is handled by WordPress usually, user asked to remove it if redundant
        thumbnailBox.hide();

        // Center Content - Preview (Shortcode moved to top)
        if (shortcodeBox.length) {
            mainWrapper.find('.firstshorts-shortcode-section').append(shortcodeBox.find('.inside').children());
            shortcodeBox.hide();
        }

        // Center Content - Settings (Swapped)
        if (displayBox.length) {
            centerPanel.find('.firstshorts-panel-body').append(displayBox.find('.inside').children());
            displayBox.hide();
        }

        // Right Content - Preview (Swapped)
        if (previewBox.length) {
            var rawPreview = previewBox.find('.inside').children();
            // If the first child is the wrapper from PHP, move its children instead
            if (rawPreview.length === 1 && rawPreview.hasClass('firstshorts-admin-preview-wrapper')) {
                rawPreview = rawPreview.children();
            }
            rightPanel.find('.firstshorts-preview-content-area').append(rawPreview);

            // MOVE NAVIGATION ARROWS to panel root so they stay sticky
            var arrows = rightPanel.find('.firstshorts-preview-nav');
            if (arrows.length) {
                rightPanel.append(arrows);
            }

            previewBox.hide();
        }

        $('.firstshorts-meta-row').remove();

        var editorWrapper = $('#postdivrich');
        if (editorWrapper.length) {
            mainWrapper.after(editorWrapper);
        }

        // --- Init Functionality ---
        updateSaveState();
        updatePreview();
        // updateShortcodePreview(); // Removed to prevent overwriting PHP state on load

        // Bind Events
        $(document).on('input', '#firstshorts_video_url', function () {
            updateSaveState();
            updatePreview();
        });
        $(document).on('change', '#firstshorts_show_buy_button', function () {
            updatePreview();
        });
        $(document).on('input', '#firstshorts_cta_text', function () {
            debouncedUpdatePreview();
        });
        $(document).on('input', '#firstshorts_cta_link', function () {
            debouncedUpdatePreview();
        });
        $(document).on('input change', '#firstshorts_video_max_width', function () {
            debouncedUpdatePreview();
        });
        $(document).on('input change', '#firstshorts_video_max_height', function () {
            debouncedUpdatePreview();
        });
        $(document).on('change', '#firstshorts_display_type', function () {
            updateSaveState();
        });
        $(document).on('change', '#firstshorts_show_likes, #firstshorts_show_save, #firstshorts_show_share, #firstshorts_show_view_count', function () {
            debouncedUpdatePreview();
        });
        $(document).on('change input', '.firstshorts-panel-settings input, .firstshorts-panel-settings select', updateSaveState);
        $(document).on('firstshorts:bulk-updated', function () {
            updateSaveState();
            updatePreview();
        });

        // Copy Shortcode Button
        mainWrapper.on('click', '.firstshorts-copy-btn', function (e) {
            e.preventDefault();
            var code = $('.firstshorts-shortcode-preview code').text();
            if (code) {
                var btn = $(this);
                navigator.clipboard.writeText(code).then(function () {
                    var originalText = btn.find('span').text();
                    btn.find('span').text('Copied!');
                    btn.addClass('is-copied');
                    setTimeout(function () {
                        btn.find('span').text(originalText);
                        btn.removeClass('is-copied');
                    }, 2000);
                });
            }
        });

        $(document).on('change', '#firstshorts_cta_style', function () {
            debouncedUpdatePreview();
        });

        // Fit Toggle
        $(document).on('click', '.firstshorts-fit-btn', function (e) {
            e.preventDefault();
            $(this).toggleClass('is-active');
            updatePreview();
        });

        // Device Toggle Buttons - REMOVED

        // Save Button
        mainWrapper.on('click', '.firstshorts-save-btn', function () {
            // Validation
            var videoUrlField = $('#firstshorts_video_url');
            var titleField = $('#title');
            var hasVideo = videoUrlField.val() || bulkItems.length > 0;
            var hasTitle = titleField.val() && titleField.val().trim() !== '';

            if (!hasTitle) {
                // Highlight the title field instead of showing an alert
                var titleWrap = $('#titlewrap');
                titleField.addClass('firstshorts-title-error');
                titleWrap.addClass('firstshorts-title-error-wrap');

                // Add or update the hint message below the title field
                var hintId = 'firstshorts-title-hint';
                var existingHint = $('#' + hintId);
                if (!existingHint.length) {
                    var hint = $('<p id="' + hintId + '" class="firstshorts-title-hint">Please add a title for your Short</p>');
                    titleWrap.after(hint);
                } else {
                    existingHint.show();
                }

                // Scroll to and focus the title field
                $('html, body').animate({ scrollTop: titleField.offset().top - 80 }, 300);
                titleField.trigger('focus');

                // Remove error state when user starts typing
                titleField.off('input.firstshortsTitle').on('input.firstshortsTitle', function () {
                    titleField.removeClass('firstshorts-title-error');
                    titleWrap.removeClass('firstshorts-title-error-wrap');
                    $('#' + hintId).hide();
                });

                return;
            }

            if (!hasVideo) {
                toggleVideoUrlError(true);
                videoUrlField.trigger('focus');
                return;
            }

            $(this).prop('disabled', true).text('Saved Short');
            $(window).off('beforeunload');
            if (window.onbeforeunload) window.onbeforeunload = null;

            // Find best button to trigger (Publish or Update)
            var publishBtn = $('#publish');
            var saveDraftBtn = $('#save-post');

            if (publishBtn.length) {
                publishBtn.trigger('click');
            } else if (saveDraftBtn.length) {
                saveDraftBtn.trigger('click');
            } else {
                $('#post').submit();
            }
        });
    }

    // --- Global Event Listeners ---

    // Bulk upload button
    $(document).on('click', '#firstshorts_bulk_upload_btn', function (e) {
        e.preventDefault();

        // Get IDs of items already in our list to exclude them from the library view
        var existingIds = bulkItems.map(function (item) { return item.id; });

        if (!bulkFrame) {
            bulkFrame = wp.media({
                title: firstshortsAdmin.uploadTitle,
                button: { text: firstshortsAdmin.uploadButton },
                library: {
                    type: firstshortsAdmin.allowedTypes || ['video'],
                    post__not_in: existingIds
                },
                multiple: true
            });

            bulkFrame.on('select', function () {
                var selection = bulkFrame.state().get('selection');
                addBulkItemsFromSelection(selection);
                renderBulkList();
                syncBulkHidden();
                updateSaveState();
                updatePreview();
            });

            // Refresh the exclusion list every time we open if frame is reused
            bulkFrame.on('open', function () {
                var currentIds = bulkItems.map(function (item) { return item.id; });
                bulkFrame.state().get('library').props.set('post__not_in', currentIds);
            });
        }

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
        e.preventDefault(); bulkItems.forEach(function (i) { i.selected = true; }); renderBulkList();
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
        var row = $(this).closest('.firstshorts-bulk-item');

        row.fadeOut(300, function () {
            bulkItems = bulkItems.filter(function (item) { return item.id !== id; });
            renderBulkList();
            setBulkFeedback('Video removed.', 'success');
        });
    });

    function navigatePreview(direction) {
        var slider = $('.firstshorts-preview-slider');
        if (!slider.length || slider.is(':animated')) return;

        var orientation = $('#firstshorts_slider_orientation').val() || 'horizontal';
        var amount = orientation === 'vertical' ? slider[0].clientHeight : slider[0].clientWidth;
        if (amount <= 0) return;

        // Pause all videos immediately
        slider.find('video').each(function () { this.pause(); });

        // Temporarily disable scroll-snap so jQuery animate() isn't cancelled by CSS
        slider.css('scroll-snap-type', 'none');

        var animProp = {};
        if (orientation === 'vertical') {
            animProp.scrollTop = slider.scrollTop() + (direction * amount);
        } else {
            animProp.scrollLeft = slider.scrollLeft() + (direction * amount);
        }

        slider.animate(animProp, 400, 'swing', function () {
            // Re-enable scroll snap after animation completes
            slider.css('scroll-snap-type', (orientation === 'vertical' ? 'y' : 'x') + ' mandatory');
            syncPreviewVideos();
        });
    }

    $(document).on('click', '#firstshorts-preview-nav-prev', function (e) {
        e.preventDefault();
        navigatePreview(-1);
    });

    $(document).on('click', '#firstshorts-preview-nav-next', function (e) {
        e.preventDefault();
        navigatePreview(1);
    });

    // Auto-pause sound when switching browser tabs (Admin Preview)
    $(document).on('visibilitychange', function () {
        if (document.hidden) {
            $('.firstshorts-preview-slider video').each(function () {
                this.pause();
            });
        } else {
            // Re-sync which video should be playing sound when tab comes back
            setTimeout(syncPreviewVideos, 100);
        }
    });

    // Initialize
    initFirstshortsAdminLayout();
    renderBulkList();
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

    // Auto-refresh preview when list changes
    $(document).on('firstshorts:bulk-updated', function () {
        updatePreview();
    });

    // Reactive Settings: Update preview when any display option changes
    $(document).on('input change',
        '#firstshorts_show_share, #firstshorts_show_buy_button, #firstshorts_cta_text, ' +
        '#firstshorts_cta_link, #firstshorts_cta_style, #firstshorts_video_max_width, ' +
        '#firstshorts_video_max_height, #firstshorts_slider_orientation, #firstshorts_scroll_snap',
        function () {
            updatePreview();
        }
    );
});

/* Inline JS moved from meta-boxes.php */
window.addEventListener('load', function () {
    document.body.classList.remove('firstshorts-admin-loading');
});
