// ----- SET UP NAVIGATION ----------------------------------------------------
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

// ----- FETCH CATALOG --------------------------------------------------------
const fetchCatalog = (catUrl = '/catalog?limit=10&offset=0') => {
    const catalogTbody = document.getElementById('catalogTbody');
    catalogTbody.innerHTML = '';
    fetch(catUrl)
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Error: ${ response.status }`);
        }        
        return response.json();
    })
    .then((json) => {
        json.forEach((v,k) => {            
            const id = String(v.id).padStart(3, '0');
            const item = `<tr>
                <td>${id}</td>
                <td>${v.artist}</td>
                <td>${v.title}</td>
                <td>${v.year}</td>
                <td>${v.media}</td>
                <td>${v.notes}</td>
            </tr>`;
            catalogTbody.innerHTML += item;
        });
    });
}
fetchCatalog();

let count = 0;
let countMax = 0;
let offset = 0;
fetch('/count')
.then((response) => {
    if(!response.ok) {
        throw new Error(`Error: ${ response.status }`);
    }        
    return response.json();
})
.then((json) => {
    count = json.count;
    document.getElementById('catalogCount').innerHTML = count;
    countMax = Math.floor(count / 10) * 10;
    const pages = document.getElementById('pages');
    const totalPages = countMax / 10;
    let pageCount = 0;
    let pageCountDisplay = 1;
    while(pageCount <= countMax){
        let pageLinkOffset = pageCountDisplay == 1 ? 0 : pageCountDisplay * 10 - 10;
        if(pageCountDisplay == 1){
            pages.innerHTML += `<a class="current-page" href="#" data-offset="${pageLinkOffset}">${pageCountDisplay}</a>`;
        }
        else{
            pages.innerHTML += `<a href="#" data-offset="${pageLinkOffset}">${pageCountDisplay}</a>`;
        }
        pageCount += 10;
        pageCountDisplay++;
    }
    const pageLinks = document.querySelectorAll('#pages a');
    pageLinks.forEach( v => {
        v.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector('.current-page').classList.toggle('current-page');
            e.target.classList.add('current-page');
            offset = parseInt(v.dataset.offset); 
            fetchCatalog(`/catalog?limit=10&offset=${offset}`);
        });
    });
});

const pageArrow = document.querySelectorAll('.page-arrow');
pageArrow.forEach(v => {
    v.addEventListener('click', e => {
        const classList = [... e.target.classList];
        const currentPage = document.querySelector('.current-page');
        const firstPage = document.querySelector('#pages a:first-child');
        const lastPage = document.querySelector('#pages a:last-child');
        if(classList.includes('back')){
            offset = offset - 10 < 0 ? 0 : offset - 10;
            if(currentPage == firstPage){
                return;
            }
            fetchCatalog(`/catalog?limit=10&offset=${offset}`);
            if(currentPage.previousElementSibling != null){
                currentPage.classList.toggle('current-page');
                currentPage.previousElementSibling.classList.add('current-page');
            }
        }
        if(classList.includes('forward')){
            offset = offset >= countMax ? offset : offset + 10;
            if(currentPage == lastPage){
                return;
            }
            fetchCatalog(`/catalog?limit=10&offset=${offset}`);
            if(currentPage.nextElementSibling != null){
                currentPage.classList.toggle('current-page');
                currentPage.nextElementSibling.classList.add('current-page');
            }
        }
    });
});

// ----- ADD RECORD -----------------------------------------------------------
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
        const item = `<div>
            <p>${json.artist}</p>
            <p>${json.title}</p>
            <p>${json.year}</p>
            <p>${json.media}</p>
            <p>${json.notes}</p>
        </div>`;
        addResults.innerHTML += item; 
        addRecord.reset();
        fetchCatalog();
    });    
});

// ----- ARTIST LIST ----------------------------------------------------------
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

// ----- SEARCH ---------------------------------------------------------------
const search = (needle) => {
    const searchTbody = document.getElementById('searchTbody'); 
    searchTbody.innerHTML = '';
    fetch(`/search/${needle}`)
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Error: ${ response.status }`);
        }        
        return response.json();
    })
    .then((json) => {
        if(typeof json.results == 'string'){
            const item = `<tr>
                <td colspan="6">No Results for <i>${needle}</i></td>
            </tr>`;
            searchTbody.innerHTML += item;
            return;
        }
        json.forEach((v,k) => {
            const id = String(v.id).padStart(3, '0');
            const item = `<tr>
                <td>${id}</td>
                <td>${v.artist}</td>
                <td>${v.title}</td>
                <td>${v.year}</td>
                <td>${v.media}</td>
                <td>${v.notes}</td>
            </tr>`;
            searchTbody.innerHTML += item;
        });
    });
}
document.querySelector('#search form').addEventListener('submit', e => {
    e.preventDefault();
    search(document.getElementById('searchField').value);
});

// ----- EDIT RECORD ----------------------------------------------------------
const getRecord = document.getElementById('getRecord');
getRecord.addEventListener('submit', e => {
    e.preventDefault();
    const needle = document.getElementById('getRecordField').value;
    fetch(`/id/${needle}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Error: ${ response.status }`);
        }        
        return response.json();
    })
    .then((json) => {
        getRecord.reset();
        document.getElementById('editId').value = json.id;
        document.getElementById('editArtist').value = json.artist;
        document.getElementById('editTitle').value = json.title;
        document.getElementById('editYear').value = json.year;
        document.getElementById('editNotes').value = json.notes;
        const editMediaType = document.querySelectorAll('#editMedia option');
        editMediaType.forEach(v => {
            v.selected = false;
            if(v.value == json.media){
                v.setAttribute('selected', true);
            }
        })
    });    
});

const editRecord = document.getElementById('editRecord');
editRecord.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(editRecord);
    const json = Object.fromEntries(data.entries());
    const id = document.getElementById('editId').value;
    fetch(`/edit/${id}`, {
        method: 'PUT',
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
        const editResults = document.getElementById('editResults');
        editResults.innerHTML = `<p><strong>${text}</strong></p>`;        
        const item = `<div>
            <p>${json.artist}</p>
            <p>${json.title}</p>
            <p>${json.year}</p>
            <p>${json.media}</p>
            <p>${json.notes}</p>
        </div>`;
        editResults.innerHTML += item; 
        editRecord.reset();
        fetchCatalog();
    });    
});

// ----- FETCH RANDOM ---------------------------------------------------------
const fetchRandom = () => {
    const randomResults = document.getElementById('randomResults');
    randomResults.innerHTML = '';
    fetch('/random')
    .then((response) => {
        if(!response.ok) {
            throw new Error(`Error: ${ response.status }`);
        }        
        return response.json();
    })
    .then((json) => {           
        const id = String(json.id).padStart(3, '0');
        const item = `
            <p>ID: ${id}</p>
            <p>Artist: ${json.artist}</p>
            <p>Title: ${json.title}</p>
            <p>Year: ${json.year}</p>
            <p>Media: ${json.media}</p>
            <p>Notes: ${json.notes}</p>
        `;
        randomResults.innerHTML = item;
    });
}
document.getElementById('getRandom').addEventListener('click', fetchRandom);
fetchRandom();