const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach( (v,k) => {
    v.addEventListener('click', e => {
        document.querySelectorAll('.open').forEach( el => {
            el.classList.toggle('open');
        });
        const targetDiv = e.currentTarget.hash.replace('#', '');
        document.getElementById(targetDiv).classList.toggle('open');
    });
});

const getCatalog = document.getElementById('getCatalog');
const catalogResults = document.getElementById('catalogResults');
catalogResults.innerHTML = '';
fetch('/catalog')
.then((response) => {
    if(!response.ok) {
        throw new Error(`Error: ${ response.status }`);
    }        
    return response.json();
})
.then((json) => {
    json.forEach((v,k) => {
        const item = `
            <p>${v.artist}</p>
            <p>${v.title}</p>
            <p>${v.year}</p>
            <p>${v.media}</p>
            <p>${v.notes}</p>
        `;
        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = item;
        catalogResults.appendChild(itemContainer);
    });
});