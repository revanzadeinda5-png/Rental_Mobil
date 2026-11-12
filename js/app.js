const cars = [
  { id: 1, name: "Honda Brio", type: "City car", price: 350000, seats: 5, transmission: "Matic", fuel: "Bensin", rating: "4.9", badge: "Paling diminati", locations: ["Jakarta", "Bandung", "Yogyakarta", "Surabaya"], image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=82", alt: "Mobil compact merah untuk perjalanan dalam kota" },
  { id: 2, name: "Toyota Avanza", type: "MPV", price: 475000, seats: 7, transmission: "Matic", fuel: "Bensin", rating: "4.9", badge: "Favorit keluarga", locations: ["Jakarta", "Bandung", "Yogyakarta", "Bali", "Surabaya"], image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=82", alt: "Mobil keluarga untuk perjalanan bersama" },
  { id: 3, name: "Mitsubishi Xpander", type: "MPV", price: 575000, seats: 7, transmission: "Matic", fuel: "Bensin", rating: "4.8", badge: "", locations: ["Jakarta", "Bandung", "Surabaya"], image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=82", alt: "MPV modern untuk liburan keluarga" },
  { id: 4, name: "Toyota Innova Zenix", type: "MPV", price: 850000, seats: 7, transmission: "Matic", fuel: "Hybrid", rating: "5.0", badge: "Premium", locations: ["Jakarta", "Bandung", "Yogyakarta", "Bali", "Surabaya"], image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=900&q=82", alt: "Mobil premium nyaman untuk perjalanan jauh" },
  { id: 5, name: "Honda HR-V", type: "SUV", price: 725000, seats: 5, transmission: "Matic", fuel: "Bensin", rating: "4.8", badge: "Siap bertualang", locations: ["Jakarta", "Bandung", "Bali", "Surabaya"], image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=82", alt: "SUV tangguh untuk menjelajah berbagai tujuan" },
  { id: 6, name: "Hyundai IONIQ 5", type: "Listrik", price: 1250000, seats: 5, transmission: "Matic", fuel: "Listrik", rating: "4.9", badge: "Electric", locations: ["Jakarta", "Bandung", "Surabaya"], image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=82", alt: "Mobil listrik modern untuk perjalanan nyaman" }
];

const carGrid = document.querySelector("#car-grid");
const categoryList = document.querySelector("#category-list");
const sortSelect = document.querySelector("#sort-select");
const searchForm = document.querySelector("#search-form");
const locationSelect = document.querySelector("#pickup-location");
const pickupDate = document.querySelector("#pickup-date");
const returnDate = document.querySelector("#return-date");
const formMessage = document.querySelector("#form-message");
const filterSummary = document.querySelector("#filter-summary");
const emptyState = document.querySelector("#empty-state");
const bookingModal = document.querySelector("#booking-modal");
const modalBackdrop = document.querySelector("#modal-backdrop");
const selectedCar = document.querySelector("#selected-car");
const bookingRequestForm = document.querySelector("#booking-request-form");
const toast = document.querySelector("#toast");

let activeCategory = "Semua";
let searchCriteria = null;
let selectedCarId = null;
let toastTimeout;

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);
}

function renderCars() {
  const criteria = searchCriteria;
  let visibleCars = cars.filter((car) => {
    const matchesCategory = activeCategory === "Semua" || car.type === activeCategory;
    const matchesLocation = !criteria || car.locations.includes(criteria.location);
    return matchesCategory && matchesLocation;
  });

  if (sortSelect.value === "price-low") visibleCars.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-high") visibleCars.sort((a, b) => b.price - a.price);

  carGrid.innerHTML = visibleCars.map((car) => `
    <article class="car-card">
      <div class="car-image-wrap">
        <img class="car-image" src="${car.image}" alt="${car.alt}" loading="lazy" />
        ${car.badge ? `<span class="car-badge">${car.badge}</span>` : ""}
        <span class="car-fuel">${car.fuel}</span>
      </div>
      <div class="car-details">
        <div class="car-topline"><span>${car.type}</span><span class="car-rating">★ ${car.rating}</span></div>
        <h3 class="car-title">${car.name}</h3>
        <div class="car-specs"><span><b class="spec-icon">♙</b>${car.seats} kursi</span><span><b class="spec-icon">⚙</b>${car.transmission}</span><span><b class="spec-icon">⌖</b>${criteria ? criteria.location : "Indonesia"}</span></div>
        <div class="car-bottom">
          <div class="car-price"><strong>${formatPrice(car.price)}</strong><small>/ hari, sudah termasuk asuransi</small></div>
          <button class="rent-button" type="button" data-book="${car.id}">Sewa mobil <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visibleCars.length > 0;
  filterSummary.hidden = !criteria;
  filterSummary.textContent = criteria
    ? `${visibleCars.length} mobil tersedia di ${criteria.location} · ${criteria.days} ${criteria.days === 1 ? "hari" : "hari"} · ${criteria.pickupLabel} – ${criteria.returnLabel}`
    : "";
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  return parseLocalDate(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function openBookingModal(carId) {
  const car = cars.find((item) => item.id === carId);
  selectedCarId = carId;
  selectedCar.innerHTML = `
    <img src="${car.image}" alt="${car.alt}" />
    <div><strong>${car.name}</strong><span>${formatPrice(car.price)} / hari · ${car.seats} kursi · ${car.transmission}</span></div>
  `;
  if (searchCriteria) {
    selectedCar.insertAdjacentHTML("beforeend", `<span class="booking-date-summary">${searchCriteria.location} · ${searchCriteria.pickupLabel} – ${searchCriteria.returnLabel}</span>`);
  }
  bookingModal.classList.add("is-open");
  bookingModal.setAttribute("aria-hidden", "false");
  modalBackdrop.hidden = false;
  requestAnimationFrame(() => modalBackdrop.classList.add("is-visible"));
  document.body.classList.add("modal-open");
  document.querySelector("#close-modal").focus();
}

function closeBookingModal() {
  bookingModal.classList.remove("is-open");
  bookingModal.setAttribute("aria-hidden", "true");
  modalBackdrop.classList.remove("is-visible");
  document.body.classList.remove("modal-open");
  window.setTimeout(() => {
    if (!bookingModal.classList.contains("is-open")) modalBackdrop.hidden = true;
  }, 220);
}

function setDateLimits() {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  pickupDate.min = localToday;
  returnDate.min = localToday;
  pickupDate.addEventListener("change", () => {
    returnDate.min = pickupDate.value || localToday;
    if (returnDate.value && returnDate.value < returnDate.min) returnDate.value = "";
  });
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryList.querySelector(".is-active").classList.remove("is-active");
  button.classList.add("is-active");
  renderCars();
});

sortSelect.addEventListener("change", renderCars);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!searchForm.reportValidity()) return;

  const pickup = parseLocalDate(pickupDate.value);
  const dropoff = parseLocalDate(returnDate.value);
  const dayCount = Math.round((dropoff - pickup) / 86400000);
  if (dayCount < 1) {
    formMessage.textContent = "Tanggal kembali harus setelah tanggal jemput.";
    return;
  }

  formMessage.textContent = "";
  searchCriteria = {
    location: locationSelect.value,
    pickup: pickupDate.value,
    dropoff: returnDate.value,
    days: dayCount,
    pickupLabel: formatDate(pickupDate.value),
    returnLabel: formatDate(returnDate.value)
  };
  renderCars();
  document.querySelector("#armada").scrollIntoView({ behavior: "smooth", block: "start" });
});

carGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-book]");
  if (button) openBookingModal(Number(button.dataset.book));
});

document.querySelector("#close-modal").addEventListener("click", closeBookingModal);
modalBackdrop.addEventListener("click", closeBookingModal);

bookingRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingRequestForm.reportValidity()) return;
  const car = cars.find((item) => item.id === selectedCarId);
  const name = new FormData(bookingRequestForm).get("name").trim();
  closeBookingModal();
  bookingRequestForm.reset();
  showToast(`Terima kasih, ${name}! Permintaan ${car.name} kamu siap dikonfirmasi tim kami.`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bookingModal.classList.contains("is-open")) closeBookingModal();
});

setDateLimits();
renderCars();
