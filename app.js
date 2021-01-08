const toggleBtn = document.getElementById('toggleBtn');
const formSubmit = document.getElementById('formSubmit');

// fungsi untuk memunculkan / menyembunyikan mobileNav
function toggleMobileNav() {
   this.classList.toggle('active');
   const icon = this.querySelector('.fas');
   const mobileNav = document.querySelector('.mobile-nav');

   // cek apakah toggleBtn terdapat class yang namanya active
   if (this.classList.contains('active')) {
      // jika active , tampilkan mobileNav
      mobileNav.classList.add('open');
      icon.className = 'fas fa-times';
   } else {
      // jika tidak active, sembunyikan mobileNav
      mobileNav.classList.remove('open');
      icon.className = 'fas fa-bars';
   }
}

// fungsi untuk menampilkan pesan kesalahan
function setErrorMessage({ element, message }) {
   const formControl = element.closest('.form-control');
   const feedbackElement = formControl.querySelector('.invalid-feedback');
   element.classList.add('invalid');
   feedbackElement.innerText = message;
}

// fungsi untuk menghapus pesan kesalahan
function removeErrorMessage(element) {
   const formControl = element.closest('.form-control');
   const feedbackElement = formControl.querySelector('.invalid-feedback');
   element.classList.remove('invalid');
   feedbackElement.innerText = '';
}

// fungsi untuk memvalidasi url
function isValidUrl(url) {
   // url pattern
   const pattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
   // return true jika urlnya valid & false jika urlnya tidak valid
   return new RegExp(pattern).test(url.toLowerCase());
}

// fungsi untuk mengambil link yang telah dipendekan ke web API
async function fetchShortenUrl(url) {
   try {
      const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);

      if (!response.ok) {
         throw new Error(`An error has occured: ${response.status}`)
      }

      const dataUrl = await response.json();
      return dataUrl.result;
   } catch (error) {
      console.log(error.message);
   }
}

// fungsi untuk menampilkan data links yang telah dipendekan ke DOM HTML
function setLinksIntoDOM(links) {
   const { original_link, short_link, short_link2, short_link3 } = links;
   const allShortLinks = [short_link, short_link2, short_link3];
   const shortlinkContainer = document.querySelector('.shortlink-container');

   shortlinkContainer.innerHTML = `
      <div class="shortlink-list">
         ${allShortLinks.map(shortlink => {
      return `
         <div div class="shortlink-card" >
            <div class="shortlink-header">
               <h6 class="original-link">${original_link}</h6>
            </div>
            <div class="shortlink-detail">
               <a href="http://${shortlink}" target="_blank" rel="noopener noreferrer" class="shortlink-name">${shortlink}</a>
               <button type="button" class="btn btn-copy" data-url="${shortlink}" onclick="copyLinkToClipboard(this.dataset.url, this)" id="copyBtn">Copy</button>
            </div>
         </div >`}).join('')}
      </div>
   `;
}

// fungsi untuk menyalink link yang telah dipendekan ke papan klip
function copyLinkToClipboard(link, button) {
   // reset semua btn-copy ke setelan awal
   document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.classList.remove('copied');
      btn.innerText = 'Copy';
   });

   const textarea = document.createElement('textarea');
   textarea.value = link;
   document.body.appendChild(textarea);
   textarea.select();

   if (document.execCommand('copy')) {
      textarea.remove();
      button.classList.add('copied');
      button.innerText = 'Copied!';
      alert('copied successfully');
   }
}

// fungsi untuk menampilkan animasi loading pada button
function showLoading(element) {
   element.disabled = true;
   element.classList.add('loading');
}

// fungsi untuk menghapus / menyembunyikan animasi loading pada button
function removeLoading(element) {
   element.disabled = false;
   element.classList.remove('loading');
}

// fungsi untuk memproses pemendekan url
function shortenUrl(e) {
   e.preventDefault();
   // ambil url yang dinputkan user
   const urlValue = this['url'].value.trim();

   // validasi form [cek apakah user menginputkan url]
   if (urlValue === '') {
      // tidak menginputkan url
      // tampilkan pesan kesalahan
      setErrorMessage({
         element: this['url'],
         message: 'Please add a link'
      })
   } else {
      // cek apakah urlnya valid
      if (!isValidUrl(urlValue)) {
         // url tidak valid
         // tampilkan pesan kesalahan
         setErrorMessage({
            element: this['url'],
            message: 'Url is not valid'
         })
      } else {
         // url valid
         // hapus pesan kesalahan
         removeErrorMessage(this['url']);
         // tampilkan animasi loading pada button
         showLoading(this['shortenBtn']);
         // get shorten url
         fetchShortenUrl(urlValue)
            .then(links => {
               // setel data links yg telah dipendekan ke DOM HTML
               setLinksIntoDOM(links);
               // hapus animasi loading pada button
               removeLoading(this['shortenBtn']);
            });
      }
   }
}

// event listener
toggleBtn.addEventListener('click', toggleMobileNav);
formSubmit.addEventListener('submit', shortenUrl);
