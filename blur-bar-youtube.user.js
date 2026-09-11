// ==UserScript==
// @name         Blur Bar YouTube
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Blur Bar YouTube
// @author       constkolesnyak
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/constkolesnyak/blur-bar-youtube/main/blur-bar-youtube.user.js
// @updateURL    https://raw.githubusercontent.com/constkolesnyak/blur-bar-youtube/main/blur-bar-youtube.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const BLUR_AMOUNT = 7; // Blur strength
    const TOGGLE_KEY = 'KeyB'; // Physical key to toggle blur bar (layout-independent)
    const HIDE_BUTTON = true; // If false, the button is shown
    ////////////////

    // Button icons, inlined so the script depends on no image host.
    // ICON_ON is the filled B (bar showing), ICON_OFF the outlined one.
    const ICON_ON =
        'data:image/png;base64,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';
    const ICON_OFF =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAV5JREFUeNrkV8FtwzAMPBtZQCt4BXUEZYR2BK9gj5CMkI4Qj9COUI+QjmCPcP0oQCCQMqUE8KME9JFpn0TeneSGJPaIQ0FuF8dW/MaRD5KW0ZFcaI8byYGk075pBe5ZFz8aeGsss6tspQdwkR40RnJ9AQjJ3ChwoFfeb2p7nPZ3UfKCUnKf5lp27AAsydw3gKPGV8uOW2Of0pgLuCBKqxZ4VXLfhbnPWh1fhJ4FIc8LXLhpcjoYHUuK8FBeHxntkhJ/qNUx7Lg0li3XshhIV2EaDsCQ0bSJXL7SsRyAk+ZaltNJ2vGYyKl7cK1UTj2AKeq+qMdXiwtlWE2Sp1f1WDOPWdGsf0WP54381brQHHCw2t+GcxVbZkmZ76BeqMBUCuwKgAdFOmfNuXLHonT4z8KHQoZsxxrg5YkrTxa0ptSWq+0I4C0HuuVcs8Ey15h3H5N1hc1efxItdor/B/w3AEFPpf2iDFzSAAAAAElFTkSuQmCC';

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
                z-index: 10;
                display: none;
                cursor: move;
                border: 2px solid transparent;
                border-radius: 4px;
                transition: opacity 0.2s, border-color 0.2s;
                box-sizing: border-box;
            }

            .blur-bar:hover {
                border-color: rgba(255, 255, 255, 0.3);
            }

            .blur-bar .toggle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: url('${ICON_ON}') center/contain no-repeat;
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
                background: url('${ICON_OFF}') center/cover no-repeat !important;
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

    function isTypingTarget(target) {
        if (!(target instanceof Element)) return false;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return true;
        // Covers the whole subtree of an editable region, comment boxes included.
        if (target.isContentEditable) return true;
        return Boolean(target.closest('#contenteditable-root'));
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
        if (HIDE_BUTTON) {
            blurBtn.style.display = 'none';
        }
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
                btn.style.backgroundImage = `url('${ICON_ON}')`;
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
            // Toggle blur bar visibility with configured key (using e.code for layout independence)
            if (e.code !== TOGGLE_KEY) return;
            // A bare key press only. Ctrl/Cmd/Alt/Shift belong to YouTube or the browser.
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
            // ...and not while the user is writing a search query or a comment.
            if (isTypingTarget(e.target)) return;

            const blurBtn = blurBtns[0];
            if (!blurBtn) return;

            e.preventDefault();
            blurBtn.click();
        });

        // Button click handlers
        blurBtns.forEach((blurBtn) => {
            blurBtn.addEventListener('click', () => {
                video.focus();
                blurBarIconActive = !blurBarIconActive;

                if (!blurBarActive && blurBarIconActive) {
                    blurBar.style.display = 'flex';
                    blurBtn.style.backgroundImage = `url('${ICON_ON}')`;
                    blurBarActive = true;

                    // Load current state from storage
                    const currentState = loadState();

                    // Set position and size
                    blurBar.style.left = currentState.left;
                    blurBar.style.top = currentState.top;
                    blurBar.style.width = currentState.width;
                    blurBar.style.height = currentState.height;
                    blurBar.style.opacity = '1';

                } else {
                    blurBar.style.display = 'none';
                    blurBtn.style.backgroundImage = `url('${ICON_OFF}')`;
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
                blurBtn.style.backgroundImage = `url('${ICON_OFF}')`;
            });
            blurBarActive = false;
            blurBarIconActive = false;
            localStorage.setItem(STORAGE_KEYS.ACTIVE, false);
            localStorage.setItem(STORAGE_KEYS.ICON_ACTIVE, false);
        });

        injected = true;
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
