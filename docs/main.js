const tabs = document.querySelectorAll('.tab-buttons div');
const contents = document.querySelectorAll('.tab-content');

tabsEvent();

function tabsEvent() {
    tabsClick(tabs, contents);
}

function tabsClick(tabs, contents) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tab.dataset.tab) {
                    content.classList.add('active');
                }
            });
        });
    });
}
