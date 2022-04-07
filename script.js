const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach( (v,k) => {
    v.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.open').forEach( el => {
            el.classList.toggle('open');
        });
        const targetDiv = e.currentTarget.hash.replace('#', '');
        document.getElementById(targetDiv).classList.toggle('open');
        const active = document.querySelector('.active');
        active.classList.toggle('active');
        v.classList.add('active');
    });
});

const getCatalog = document.getElementById('getCatalog');
const catalogTbody = document.getElementById('catalogTbody');
catalogTbody.innerHTML = '';
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
            <td>${v.artist}</td>
            <td>${v.title}</td>
            <td>${v.year}</td>
            <td>${v.media}</td>
            <td>${v.notes}</td>
        `;
        const itemContainer = document.createElement('tr');
        itemContainer.innerHTML = item;
        catalogTbody.appendChild(itemContainer);
    });
});

const addRecord = document.getElementById('addRecord');
addRecord.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(addRecord);
    const json = Object.fromEntries(data.entries());
    fetch('/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },        
        body: JSON.stringify(json)
    })
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Error: ${ response.status }`);
        }        
        return response.text();
    })
    .then((text) => {
        const addResults = document.getElementById('addResults');
        addResults.innerHTML = `<p><strong>${text}</strong></p>`;        
        const item = `
            <p>${json.artist}</p>
            <p>${json.title}</p>
            <p>${json.year}</p>
            <p>${json.media}</p>
            <p>${json.notes}</p>
        `;
        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = item;
        addResults.appendChild(itemContainer);    
        addRecord.reset();
    });    
});

fetch('/artist-list')
.then((response) => {
    if(!response.ok) {
        throw new Error(`Error: ${ response.status }`);
    }        
    return response.json();
})
.then((json) => {
    json.forEach((v) => {
        const artist = `<li>${v}</li>`;
        document.getElementById('artistList').innerHTML += artist;
    });
});