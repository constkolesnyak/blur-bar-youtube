// ==UserScript==
// @name         Blur Bar YouTube
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Blur Bar YouTube
// @author       tsnok
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const BLUR_AMOUNT = 7; // Blur strength
    const TOGGLE_KEY = 'b'; // Key to toggle blur bar on/off
    ////////////////

    let injected = false;
    let blurBarActive = false;
    let blurBarIconActive = false;

    const STORAGE_KEYS = {
        LEFT: 'blurBar_left',
        TOP: 'blurBar_top',
        WIDTH: 'blurBar_width',
        HEIGHT: 'blurBar_height',
        ACTIVE: 'blurBar_active',
        ICON_ACTIVE: 'blurBar_iconActive',
    };

    function loadState() {
        return {
            left: localStorage.getItem(STORAGE_KEYS.LEFT) || '10%',
            top: localStorage.getItem(STORAGE_KEYS.TOP) || '75%',
            width: localStorage.getItem(STORAGE_KEYS.WIDTH) || '80%',
            height: localStorage.getItem(STORAGE_KEYS.HEIGHT) || '10%',
            active: localStorage.getItem(STORAGE_KEYS.ACTIVE) === 'true',
            iconActive:
                localStorage.getItem(STORAGE_KEYS.ICON_ACTIVE) === 'true',
        };
    }

    function saveState(blurBar, video) {
        // Use offsetWidth/offsetHeight to get actual pixel dimensions
        const lPercentage = (blurBar.offsetLeft / video.offsetWidth) * 100;
        const tPercentage = (blurBar.offsetTop / video.offsetHeight) * 100;
        const wPercentage = (blurBar.offsetWidth / video.offsetWidth) * 100;
        const hPercentage = (blurBar.offsetHeight / video.offsetHeight) * 100;

        localStorage.setItem(STORAGE_KEYS.LEFT, `${lPercentage}%`);
        localStorage.setItem(STORAGE_KEYS.TOP, `${tPercentage}%`);
        localStorage.setItem(STORAGE_KEYS.WIDTH, `${wPercentage}%`);
        localStorage.setItem(STORAGE_KEYS.HEIGHT, `${hPercentage}%`);
        localStorage.setItem(STORAGE_KEYS.ACTIVE, blurBarActive);
        localStorage.setItem(STORAGE_KEYS.ICON_ACTIVE, blurBarIconActive);
    }

    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blur-bar {
                position: absolute;
                backdrop-filter: blur(${BLUR_AMOUNT}px);
                -webkit-backdrop-filter: blur(${BLUR_AMOUNT}px);
                background: transparent;
                z-index: 100;
                display: none;
                cursor: move;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                transition: opacity 0.2s;
                box-sizing: border-box;
            }

            .blur-bar .toggle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: url('https://i.imgur.com/zRjwzJv.png') center/contain no-repeat;
                cursor: pointer;
                display: none;
                z-index: 101;
            }

            .blur-bar .resize-handle {
                position: absolute;
                background: transparent;
                display: none;
            }

            .blur-bar .resize-handle.corner {
                width: 15px;
                height: 15px;
                background: rgba(255, 255, 255, 0.5);
                z-index: 2;
            }

            .blur-bar .resize-handle.edge {
                background: transparent;
                z-index: 1;
            }

            .blur-bar:hover .resize-handle {
                display: block;
            }

            .blur-bar .resize-se {
                right: 0;
                bottom: 0;
                cursor: se-resize;
            }

            .blur-bar .resize-sw {
                left: 0;
                bottom: 0;
                cursor: sw-resize;
            }

            .blur-bar .resize-ne {
                right: 0;
                top: 0;
                cursor: ne-resize;
            }

            .blur-bar .resize-nw {
                left: 0;
                top: 0;
                cursor: nw-resize;
            }

            .blur-bar .resize-n {
                left: 0;
                top: -5px;
                width: 100%;
                height: 15px;
                cursor: n-resize;
            }

            .blur-bar .resize-s {
                left: 0;
                bottom: -5px;
                width: 100%;
                height: 15px;
                cursor: s-resize;
            }

            .blur-bar .resize-e {
                right: -5px;
                top: 0;
                width: 15px;
                height: 100%;
                cursor: e-resize;
            }

            .blur-bar .resize-w {
                left: -5px;
                top: 0;
                width: 15px;
                height: 100%;
                cursor: w-resize;
            }

            .blur {
                background: url('https://i.imgur.com/xG4zQb3.png') center/cover no-repeat !important;
                width: 36px;
                height: 36px;
                border: none;
                cursor: pointer;
                opacity: 0.9;
                transition: opacity 0.2s;
            }

            .blur:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    function makeDraggable(element, video) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on any resize handle or toggle button
            if (
                e.target.classList.contains('resize-handle') ||
                e.target.classList.contains('toggle') ||
                e.target.closest('.resize-handle')
            )
                return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = element.offsetLeft;
            startTop = element.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;

            // Containment
            newLeft = Math.max(
                0,
                Math.min(newLeft, video.offsetWidth - element.offsetWidth)
            );
            newTop = Math.max(
                0,
                Math.min(newTop, video.offsetHeight - element.offsetHeight)
            );

            const leftPercent = (newLeft / video.offsetWidth) * 100;
            const topPercent = (newTop / video.offsetHeight) * 100;

            element.style.left = `${leftPercent}%`;
            element.style.top = `${topPercent}%`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                saveState(element, video);
            }
        });
    }

    function makeResizable(element, video) {
        const corners = ['se', 'sw', 'ne', 'nw'];
        const edges = ['n', 's', 'e', 'w'];
        const handles = {};

        corners.forEach((dir) => {
            const handle = document.createElement('div');
            handle.className = `resize-handle corner resize-${dir}`;
            element.appendChild(handle);
            handles[dir] = handle;
        });

        edges.forEach((dir) => {
            const handle = document.createElement('div');
            handle.className = `resize-handle edge resize-${dir}`;
            element.appendChild(handle);
            handles[dir] = handle;
        });

        let isResizing = false;
        let currentCorner = null;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        Object.entries(handles).forEach(([corner, handle]) => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentCorner = corner;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = element.offsetWidth;
                startHeight = element.offsetHeight;
                startLeft = element.offsetLeft;
                startTop = element.offsetTop;
                e.stopPropagation();
                e.preventDefault();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            // Calculate new dimensions based on direction
            if (currentCorner === 'se') {
                newWidth = startWidth + deltaX;
                newHeight = startHeight + deltaY;
            } else if (currentCorner === 'sw') {
                newWidth = startWidth - deltaX;
                newHeight = startHeight + deltaY;
                newLeft = startLeft + deltaX;
            } else if (currentCorner === 'ne') {
                newWidth = startWidth + deltaX;
                newHeight = startHeight - deltaY;
                newTop = startTop + deltaY;
            } else if (currentCorner === 'nw') {
                newWidth = startWidth - deltaX;
                newHeight = startHeight - deltaY;
                newLeft = startLeft + deltaX;
                newTop = startTop + deltaY;
            } else if (currentCorner === 'n') {
                newHeight = startHeight - deltaY;
                newTop = startTop + deltaY;
            } else if (currentCorner === 's') {
                newHeight = startHeight + deltaY;
            } else if (currentCorner === 'e') {
                newWidth = startWidth + deltaX;
            } else if (currentCorner === 'w') {
                newWidth = startWidth - deltaX;
                newLeft = startLeft + deltaX;
            }

            // Containment
            newWidth = Math.max(
                50,
                Math.min(newWidth, video.offsetWidth - newLeft)
            );
            newHeight = Math.max(
                30,
                Math.min(newHeight, video.offsetHeight - newTop)
            );
            newLeft = Math.max(0, Math.min(newLeft, video.offsetWidth - 50));
            newTop = Math.max(0, Math.min(newTop, video.offsetHeight - 30));

            const widthPercent = (newWidth / video.offsetWidth) * 100;
            const heightPercent = (newHeight / video.offsetHeight) * 100;
            const leftPercent = (newLeft / video.offsetWidth) * 100;
            const topPercent = (newTop / video.offsetHeight) * 100;

            element.style.width = `${widthPercent}%`;
            element.style.height = `${heightPercent}%`;
            element.style.left = `${leftPercent}%`;
            element.style.top = `${topPercent}%`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                currentCorner = null;
                saveState(element, video);
            }
        });
    }

    function addBtn() {
        // Only add to the first control menu to avoid duplicates
        const controlMenu = document.querySelector('.ytp-right-controls');
        if (!controlMenu) return [];

        const blurBtn = document.createElement('button');
        blurBtn.className = 'blur';
        blurBtn.type = 'button';
        blurBtn.title = 'Blur Bar';
        controlMenu.insertBefore(blurBtn, controlMenu.firstChild);
        return [blurBtn];
    }

    function addBlurBar() {
        const blurBar = document.createElement('div');
        blurBar.className = 'blur-bar';

        const btnToggle = document.createElement('div');
        btnToggle.className = 'toggle';
        blurBar.append(btnToggle);

        const videoPlayer = document.getElementById('movie_player');
        if (!videoPlayer) {
            throw new Error('movie_player not found');
        }

        videoPlayer.append(blurBar);
        return blurBar;
    }

    function inject() {
        if (injected) return;

        // Check if already injected in DOM
        if (
            document.querySelector('.blur') ||
            document.querySelector('.blur-bar')
        ) {
            injected = true;
            return;
        }

        let blurBar,
            blurBtns = [];

        try {
            blurBtns = addBtn();
            blurBar = addBlurBar();
        } catch (e) {
            console.error('Blur bar injection failed:', e);
            return;
        }

        const toggleBtn = blurBar.querySelector('.toggle');
        const video = document.getElementById('movie_player');
        const videoStream = document.querySelector('.html5-main-video');

        if (!video || !videoStream || !toggleBtn) {
            console.error('Required elements not found');
            return;
        }

        // Load saved state
        const savedState = loadState();
        blurBarActive = savedState.active;
        blurBarIconActive = savedState.iconActive;

        // Make draggable and resizable
        makeDraggable(blurBar, video);
        makeResizable(blurBar, video);

        // Restore state if it was active
        if (blurBarIconActive) {
            blurBtns.forEach((btn) => {
                btn.style.backgroundImage =
                    "url('https://i.imgur.com/zRjwzJv.png')";
            });
            if (blurBarActive) {
                blurBar.style.display = 'flex';
                blurBar.style.left = savedState.left;
                blurBar.style.top = savedState.top;
                blurBar.style.width = savedState.width;
                blurBar.style.height = savedState.height;
                blurBar.style.opacity = '1';
            }
        }

        // Toggle button hover
        toggleBtn.addEventListener('mouseover', () => {
            blurBar.style.opacity = '0';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            blurBar.style.opacity = '1';
        });

        // Keyboard controls - global listener
        document.addEventListener('keyup', (e) => {
            // Toggle blur bar visibility with configured key
            if (e.key === TOGGLE_KEY) {
                e.preventDefault();
                blurBtns[0].click();
            }
            // Hide/show blur bar with 's' key when active
            if (e.key === 's' && blurBarIconActive) {
                blurBarActive = !blurBarActive;
                blurBar.style.opacity = blurBarActive ? '1' : '0';
                localStorage.setItem(STORAGE_KEYS.ACTIVE, blurBarActive);
            }
        });

        // Button click handlers
        blurBtns.forEach((blurBtn) => {
            blurBtn.addEventListener('click', () => {
                video.focus();
                blurBarIconActive = !blurBarIconActive;

                if (!blurBarActive && blurBarIconActive) {
                    blurBar.style.display = 'flex';
                    blurBtn.style.backgroundImage =
                        "url('https://i.imgur.com/zRjwzJv.png')";
                    blurBarActive = true;

                    // Load current state from storage
                    const currentState = loadState();

                    // Set position and size
                    blurBar.style.left = currentState.left;
                    blurBar.style.top = currentState.top;
                    blurBar.style.width = currentState.width;
                    blurBar.style.height = currentState.height;
                    blurBar.style.opacity = '1';

                    console.log('Loaded state:', currentState);
                } else {
                    blurBar.style.display = 'none';
                    blurBtn.style.backgroundImage =
                        "url('https://i.imgur.com/xG4zQb3.png')";
                    blurBarActive = false;
                }

                localStorage.setItem(STORAGE_KEYS.ACTIVE, blurBarActive);
                localStorage.setItem(
                    STORAGE_KEYS.ICON_ACTIVE,
                    blurBarIconActive
                );
            });
        });

        // Video ended
        videoStream.addEventListener('ended', () => {
            blurBar.style.display = 'none';
            blurBtns.forEach((blurBtn) => {
                blurBtn.style.backgroundImage =
                    "url('https://i.imgur.com/xG4zQb3.png')";
            });
            blurBarActive = false;
            blurBarIconActive = false;
            localStorage.setItem(STORAGE_KEYS.ACTIVE, false);
            localStorage.setItem(STORAGE_KEYS.ICON_ACTIVE, false);
        });

        injected = true;
        console.log('Blur bar injected successfully!');
    }

    function waitForPlayer() {
        const controls = document.querySelector('.ytp-right-controls');
        const player = document.getElementById('movie_player');
        if (controls && player && !injected) {
            inject();
        } else if (!controls || !player) {
            setTimeout(waitForPlayer, 500);
        }
    }

    // Add styles
    addStyles();

    // Navigation handler
    document.body.addEventListener('yt-navigate-finish', () => {
        injected = false;
        if (window.location.href.includes('watch')) {
            waitForPlayer();
        }
    });

    // Initial load
    if (window.location.href.includes('watch')) {
        waitForPlayer();
    }
})();
