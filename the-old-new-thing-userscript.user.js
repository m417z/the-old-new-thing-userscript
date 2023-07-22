// ==UserScript==
// @name         The Old New Thing comments
// @namespace    https://m417z.com/
// @version      1.1
// @description  Shows archived comments for old pages of The Old New Thing, fixes old links
// @author       m417z
// @match        https://devblogs.microsoft.com/oldnewthing/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('p');
    if (postId && postId.match(/^[0-9]+$/) && parseInt(postId, 10) < 100635) {
        loadComments().catch(error => alert(error.message));
    }

    fixLinks(document.body);

    async function loadComments() {
        const url = `https://m417z.com/the-old-new-thing-userscript/comments/${postId}.htm`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                return;
            }

            throw new Error(`Failed to load comments: ${response.status}`);
        }

        const style = `<style>
            #comments, #comments * {
                all: revert;
            }

            #comments ol.comment-list {
                padding: 0;
            }

            #comments ol.comment-list > li.comment {
                background-color: #fff;
                border-radius: 4px;
                box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
                list-style-type: none;
                padding: 0.5em 1em;
                margin: 1em;
            }
        </style>`;

        const html = await response.text();

        const commentsElement = document.getElementById('comments');
        commentsElement.innerHTML = style + html;
        fixLinks(commentsElement);

        // Jump to comment if specified in the URL.
        if (location.hash.startsWith('#comment-')) {
            location.href = location.hash;
        }
    }

    function fixLinks(targetElement) {
        for (const link of targetElement.querySelectorAll('a')) {
            let match;
            if ((match = link.href.match(/^https?:\/\/(?:weblogs\.asp\.net|blogs\.msdn(?:\.microsoft)?\.com|devblogs\.microsoft\.com)(?:\/b)?\/oldnewthing\/archive\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})(\/|$)/))) {
                link.href = `https://devblogs.microsoft.com/oldnewthing/${match[1]}/${match[2]}/${match[3]}`;
                continue;
            }
            if ((match = link.href.match(/^https?:\/\/blogs\.msdn\.microsoft\.com\/oldnewthing\/(.*)$/))) {
                link.href = `https://devblogs.microsoft.com/oldnewthing/${match[1]}`;
                continue;
            }
        }
    }
})();
