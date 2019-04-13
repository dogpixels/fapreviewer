/*	
 *	FurAffinity Previewer for Firefox
 * 	Version 2.0
 * 	draconigen@gmail.com
 *  inspired by the original for Chrome: FA Previewer by Serofox
 */

var debug = false;

var links = document.querySelectorAll('.gallery a[href^="/view/"]:not([title])');

links.forEach(link => {
	var id = link.href.match('view\/([0-9]*)\/')[1];
	
	var img = document.createElement('img');
	var div = document.createElement('div');
	div.appendChild(img);

	var blob = sessionStorage.getItem(id);

	// init with loading img
	if (!blob) {
		img.src = 'data:image/gif;base64,R0lGODdhPAA8AHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQEFAAAACwAAAAAPAA8AIEVFRViYmIAAAAAAAACmISPqWvhD6Ocjtl7qN4P+8WF00dm4lmVJIqqKyu6HxzLGB3aN77pF9/zMYAa4ZA4MiqQSSWCKXEmoBHpk9qxNrApLbdr/Qa0Wy4ZID6nyWvvV/1mx91meZ2OhXMF/L7/DxgoOEhYaHiImKi4yNjo+AgZKTlJWWl5iZmpucnZ6fkJGio6SlpqeoqaqrrK2ur6ChsrO0tbi1kAACH5BAQUAAAALAAAAAA8ADwAgQAAABUVFWJiYgAAAAKxhI+pa+EPo5yO2Xuo3g/7xYXTR2biWZUkiqorK7ofHMsYHdo3vukX3/MxgBrhkDgyKpBJJYIpcSagEemT2rE2sCktt2v9BrRbLhkgPqfJa+9X/WbH3WZ5nY6F362Cvv8PGCjYdzZoeOhXiLgYqMj4KOAIuSg5eVhpOYiZ2UjGibj5megpqkla2qmFKhha2ir6+hnLOZtZa3k7mQu5+9jL+Et5ujqqSvwXDDp8nHy5TFwAACH5BAQUAAAALAAAAAA8ADwAgQAAAGJiYhUVFQAAAAKYhI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+LwoIh8Si8SgUKJfMpvOpREqnQ6j1uqRqj9jucwuuesfRMJhMNp/RXvWW3XZT4V35nH61T/F5PZJv5fcH+CVoRFhoSITopFjE2OS4CJklmURZZomZKbkpYHmJCRrgOVoKeqq5abqK2qoq6hoLS8mKWQAAIfkEBBQAAAAsAAAAADwAPACBYmJiAAAAFRUVAAAAArKEj6lr4Q+jnI7Ze6jeD/vFhdNHZuJZlSSKqisruh8cyxgd2je+6Rff8zGAGuGQODIqkEklgilxJqAR6ZPasTawKS23a/0GtFsuGSA+p8lr71f9ZsfdZnmdjoVzBfy+/w8YyCcmWGjYR3ioCJi46CjQ+KgYKWlIWSl4icn4tXmo6YnYGZo5Ssq5d4qKpbpK1foHSiobSutpu4mLqVvJK+n7COwovEg8aQoLiQxr/LncKlYAADs=';
		img.alt = 'void';
	}
	// or with image from storage if available
	else {
		img.src = blob;
		img.alt = id;
	}

	div.classList.add('fap-container', 'fap-hidden');	

	document.body.appendChild(div);

	link.addEventListener('mouseenter', async function(e) {
		if (debug) console.log(e);

		div.classList.replace('fap-hidden', 'fap-visible');

		if (img.alt === 'void') {
			img.alt = 'Loading...';
			try {
				// dirty dog footprints ahead...
				var pageHtml = await (await fetch(link.href)).text();
				var blob = await readBlob(await (await fetch('https:' + pageHtml.match(new RegExp('<a href="(\/\/[^ ]*)">Download<\/a>', 'mi'))[1])).blob());
				
				img.src = blob;
				img.alt = id;

				setDimensions(div, e);

				sessionStorage.setItem(id, blob);
			}
			catch(ex) {
				if (debug) console.error(ex);
				img.alt = 'void';
			}
		}
	});

	link.addEventListener('mouseleave', function(e) {
		if (debug) console.log(e);
		div.classList.replace('fap-visible', 'fap-hidden');
	});

	link.addEventListener('mousemove', function(e) {
		// if (debug) console.log(e);
		div.classList.replace('fap-hidden', 'fap-visible');
		setDimensions(div, e);
	});
});

function readBlob(blob) {
	return new Promise((resolve, reject) => {
		var r = new FileReader();
		r.onload = () => {resolve(r.result)};
		r.onerror = reject;
		r.readAsDataURL(blob);
	})
}

function setDimensions(div, e) {
	var mposx = e.clientX;
	var mposy = e.clientY;

	// Q I
	if (mposx < (window.innerWidth / 2) && mposy < window.innerHeight / 2) {
		div.style.justifyContent = 'flex-start';
		div.style.alignItems = 'flex-start';
		div.style.left = mposx + 'px';
		div.style.top = mposy + 'px';
		div.style.width = window.innerWidth - mposx - 60 + 'px'; // -20 for scrollbar
		div.style.height = window.innerHeight - mposy - 50 + 'px';
	}

	// Q II
	else if (mposx >= (window.innerWidth / 2) && mposy < window.innerHeight / 2) {
		div.style.justifyContent = 'flex-end';
		div.style.alignItems = 'flex-start';
		div.style.left = 0;
		div.style.top = mposy + 'px';
		div.style.width = mposx - 40 + 'px';
		div.style.height = window.innerHeight - mposy - 50 + 'px';
	}

	// Q III
	else if (mposx >= (window.innerWidth / 2) && mposy >= window.innerHeight / 2) {
		div.style.justifyContent = 'flex-end';
		div.style.alignItems = 'flex-end';
		div.style.left = 0;
		div.style.top = 0;
		div.style.width = mposx - 40 + 'px';
		div.style.height = mposy - 40 + 'px';
	}

	// Q IV
	else if (mposx < (window.innerWidth / 2) && mposy >= window.innerHeight / 2) {
		div.style.justifyContent = 'flex-start';
		div.style.alignItems = 'flex-end';
		div.style.left = mposx + 'px';
		div.style.top = 0;
		div.style.width = window.innerWidth - mposx - 60 + 'px';
		div.style.height = mposy - 40 + 'px';
	}
}

