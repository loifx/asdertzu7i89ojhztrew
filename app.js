(function() {
    'use strict';

    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    const searchInput = document.getElementById('searchInput');

    let currentTabIndex = 0;

    function switchTab(index) {
        tabs.forEach((tab, i) => {
            const isActive = i === index;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });

        currentTabIndex = index;
    }

    function handleTabClick(index) {
        switchTab(index);
        clearHighlights();
        searchInput.value = '';
    }

    function handleKeydown(event) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            const newIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1;
            switchTab(newIndex);
            tabs[newIndex].focus();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            const newIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0;
            switchTab(newIndex);
            tabs[newIndex].focus();
        }
    }

    function searchContent(query) {
        if (!query.trim()) {
            clearHighlights();
            return;
        }

        clearHighlights();
        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;
        const textNodes = getTextNodes(activePanel);
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        let hasResults = false;

        textNodes.forEach(node => {
            const text = node.textContent;
            if (node.parentNode && node.parentNode.closest('th')) return; 

            if (regex.test(text)) {
                hasResults = true;
                const highlightedText = text.replace(regex, '<span class="highlight">$1</span>');
                const wrapper = document.createElement('div');
                wrapper.innerHTML = highlightedText;
                
                while (wrapper.firstChild) {
                    node.parentNode.insertBefore(wrapper.firstChild, node);
                }
                node.parentNode.removeChild(node);
            }
        });

        if (hasResults) {
            showSearchResults(query);
        } else {
            hideSearchResults(query, true);
        }
    }

    function clearHighlights() {
        const highlights = document.querySelectorAll('.highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        hideSearchResults();
    }

    function getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showSearchResults(query) {
        let resultsDiv = document.querySelector('.search-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.className = 'search-results';
            const activePanel = document.querySelector('.tab-panel.active');
            if (activePanel) activePanel.insertBefore(resultsDiv, activePanel.firstChild);
        }
        const count = document.querySelectorAll('.highlight').length;
        resultsDiv.textContent = `Suchergebnisse für "${query}" gefunden (${count} Treffer)`;
    }

    function hideSearchResults(query, noResults = false) {
        const resultsDiv = document.querySelector('.search-results');
        if (resultsDiv) {
            if (noResults) {
                resultsDiv.textContent = `Keine Suchergebnisse für "${query}" gefunden.`;
                resultsDiv.style.background = 'linear-gradient(135deg, #f8d7da, #f5c6cb)';
                setTimeout(() => resultsDiv.remove(), 4000);
            } else {
                resultsDiv.remove();
            }
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => handleTabClick(index));
        tab.addEventListener('keydown', handleKeydown);
    });

    searchInput.addEventListener('input', (e) => {
        searchContent(e.target.value);
    });

    switchTab(0);

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            searchInput.focus();
        }
    });
    
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    document.addEventListener('keydown', (event) => {
        if (event.keyCode === 123) {
            event.preventDefault();
            return;
        }

        if (event.ctrlKey && event.key === 'u') {
            event.preventDefault();
            return;
        }

        if (event.ctrlKey && event.shiftKey && (event.key === 'i' || event.key === 'j' || event.key === 'c')) {
            event.preventDefault();
            return;
        }
    });

    const threshold = 160;
    const detectDevTools = () => {
        if ((window.innerHeight - screen.availHeight > threshold) || (window.innerWidth - screen.availWidth > threshold)) {
             document.body.innerHTML = 'Zugriff verweigert.';
        }
    };

    window.addEventListener('resize', detectDevTools);
})();
