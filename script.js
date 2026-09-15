/* =========================================
   BUKTI BARANG
   JAVASCRIPT FINAL
========================================= */

"use strict";


/* =========================================
   DATA
========================================= */

let proofs = [];

try {
    proofs =
        JSON.parse(
            localStorage.getItem("buktiBarang")
        ) || [];
} catch (error) {
    console.error(error);
    proofs = [];
}

let currentPhoto = "";
let currentDetail = null;
let cameraStream = null;


/* =========================================
   ELEMENT
========================================= */

const newProofButton =
    document.getElementById("newProofButton");

const closeFormButton =
    document.getElementById("closeFormButton");

const cameraButton =
    document.getElementById("cameraButton");

const closeCameraButton =
    document.getElementById("closeCameraButton");

const captureButton =
    document.getElementById("captureButton");

const closeDetailButton =
    document.getElementById("closeDetailButton");

const deleteAllButton =
    document.getElementById("deleteAllButton");

const themeButton =
    document.getElementById("themeButton");

const formModal =
    document.getElementById("formModal");

const cameraModal =
    document.getElementById("cameraModal");

const detailModal =
    document.getElementById("detailModal");

const cameraVideo =
    document.getElementById("cameraVideo");

const cameraCanvas =
    document.getElementById("cameraCanvas");

const galleryInput =
    document.getElementById("galleryInput");

const photoPreview =
    document.getElementById("photoPreview");

const proofForm =
    document.getElementById("proofForm");

const proofList =
    document.getElementById("proofList");

const totalProof =
    document.getElementById("totalProof");

const totalValue =
    document.getElementById("totalValue");

const detailContent =
    document.getElementById("detailContent");


/* =========================================
   CHECK ELEMENT
========================================= */

console.log("Bukti Barang berhasil dimuat.");

if (!newProofButton) {
    console.error("newProofButton tidak ditemukan.");
}


/* =========================================
   STORAGE
========================================= */

function saveData() {

    try {

        localStorage.setItem(
            "buktiBarang",
            JSON.stringify(proofs)
        );

    } catch (error) {

        console.error(error);

        alert(
            "Penyimpanan penuh. Coba hapus beberapa bukti lama."
        );

    }

}


/* =========================================
   RUPIAH
========================================= */

function rupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(Number(number) || 0);

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


/* =========================================
   OPEN FORM
========================================= */

function openForm() {

    if (!formModal) {
        alert("Form tidak ditemukan.");
        return;
    }

    currentPhoto = "";

    resetForm();

    formModal.classList.add("active");

    document.body.style.overflow =
        "hidden";

}


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    if (proofForm) {
        proofForm.reset();
    }

    const transactionType =
        document.getElementById(
            "transactionType"
        );

    const category =
        document.getElementById(
            "category"
        );

    if (transactionType) {
        transactionType.value =
            "Pemasukan";
    }

    if (category) {
        category.value =
            "Barang";
    }

    resetPhotoPreview();

}


/* =========================================
   CLOSE FORM
========================================= */

function closeForm() {

    if (!formModal) return;

    formModal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


/* =========================================
   PHOTO PREVIEW RESET
========================================= */

function resetPhotoPreview() {

    if (!photoPreview) return;

    photoPreview.classList.remove(
        "has-image"
    );

    photoPreview.innerHTML = `
        <div>
            📷
        </div>

        <p>
            Belum ada foto
        </p>
    `;

}


/* =========================================
   GALLERY PHOTO
========================================= */

if (galleryInput) {

    galleryInput.addEventListener(
        "change",
        function(event) {

            handlePhoto(event);

        }
    );

}


/* =========================================
   HANDLE PHOTO
========================================= */

function handlePhoto(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert(
            "File harus berupa gambar."
        );

        return;

    }

    compressImage(
        file,
        1200,
        0.78
    )
    .then(
        function(dataURL) {

            currentPhoto =
                dataURL;

            if (photoPreview) {

                photoPreview.classList.add(
                    "has-image"
                );

                photoPreview.innerHTML = `
                    <img
                        src="${dataURL}"
                        alt="Foto barang"
                    >
                `;

            }

        }
    )
    .catch(
        function(error) {

            console.error(error);

            alert(
                "Foto gagal diproses."
            );

        }
    );

}


/* =========================================
   COMPRESS IMAGE
========================================= */

function compressImage(
    file,
    maxWidth = 1200,
    quality = 0.78
) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    const img =
                        new Image();

                    img.onload =
                        function() {

                            let width =
                                img.width;

                            let height =
                                img.height;

                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    height *
                                    (
                                        maxWidth /
                                        width
                                    );

                                width =
                                    maxWidth;

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                width;

                            canvas.height =
                                height;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );

                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                )
                            );

                        };

                    img.onerror =
                        reject;

                    img.src =
                        event.target.result;

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   OPEN LIVE CAMERA
========================================= */

async function openCamera() {

    if (!cameraModal) {
        alert("Kamera tidak ditemukan.");
        return;
    }

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Browser tidak mendukung kamera langsung."
        );

        return;

    }

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: {
                            ideal: "environment"
                        },
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },
                    audio: false
                }
            );

        cameraVideo.srcObject =
            cameraStream;

        cameraModal.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

        await cameraVideo.play();

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        let message =
            "Kamera tidak bisa dibuka.";

        if (
            error.name ===
            "NotAllowedError"
        ) {

            message =
                "Izin kamera ditolak. Izinkan kamera untuk website ini di Chrome.";

        } else if (
            error.name ===
            "NotFoundError"
        ) {

            message =
                "Kamera tidak ditemukan di perangkat.";

        } else if (
            error.name ===
            "NotReadableError"
        ) {

            message =
                "Kamera sedang digunakan aplikasi lain.";

        } else if (
            error.name ===
            "SecurityError"
        ) {

            message =
                "Kamera membutuhkan koneksi HTTPS.";

        }

        alert(message);

    }

}


/* =========================================
   CAPTURE PHOTO
========================================= */

function takePhoto() {

    if (!cameraVideo) return;

    if (
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight
    ) {

        alert(
            "Kamera belum siap. Tunggu sebentar."
        );

        return;

    }

    const width =
        cameraVideo.videoWidth;

    const height =
        cameraVideo.videoHeight;

    const maxWidth = 1200;

    let finalWidth =
        width;

    let finalHeight =
        height;

    if (
        finalWidth >
        maxWidth
    ) {

        finalHeight =
            finalHeight *
            (
                maxWidth /
                finalWidth
            );

        finalWidth =
            maxWidth;

    }

    cameraCanvas.width =
        finalWidth;

    cameraCanvas.height =
        finalHeight;

    const ctx =
        cameraCanvas.getContext(
            "2d"
        );

    ctx.drawImage(
        cameraVideo,
        0,
        0,
        finalWidth,
        finalHeight
    );

    currentPhoto =
        cameraCanvas.toDataURL(
            "image/jpeg",
            0.82
        );

    if (photoPreview) {

        photoPreview.classList.add(
            "has-image"
        );

        photoPreview.innerHTML = `
            <img
                src="${currentPhoto}"
                alt="Foto barang"
            >
        `;

    }

    closeCamera();

}


/* =========================================
   CLOSE CAMERA
========================================= */

function closeCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function(track) {

                    track.stop();

                }
            );

        cameraStream =
            null;

    }

    if (cameraVideo) {

        cameraVideo.srcObject =
            null;

    }

    if (cameraModal) {

        cameraModal.classList.remove(
            "active"
        );

    }

    document.body.style.overflow =
        "";

}


/* =========================================
   SAVE PROOF
========================================= */

if (proofForm) {

    proofForm.addEventListener(
        "submit",
        function(event) {

            saveProof(event);

        }
    );

}


function saveProof(event) {

    event.preventDefault();

    const itemName =
        document.getElementById(
            "itemName"
        ).value.trim();

    const type =
        document.getElementById(
            "transactionType"
        ).value;

    const amount =
        Number(
            document.getElementById(
                "amount"
            ).value
        );

    const category =
        document.getElementById(
            "category"
        ).value;

    const note =
        document.getElementById(
            "note"
        ).value.trim();

    if (!itemName) {

        alert(
            "Masukkan nama barang."
        );

        return;

    }

    if (!amount || amount <= 0) {

        alert(
            "Masukkan nominal yang benar."
        );

        return;

    }

    if (!currentPhoto) {

        alert(
            "📷 Foto barang terlebih dahulu."
        );

        return;

    }

    const now =
        new Date();

    const proof = {

        id:
            Date.now(),

        itemName:
            itemName,

        type:
            type,

        amount:
            amount,

        category:
            category,

        note:
            note,

        photo:
            currentPhoto,

        date:
            now.toISOString()

    };

    proofs.unshift(
        proof
    );

    saveData();

    updateDashboard();

    renderProofs();

    closeForm();

    alert(
        "✅ Bukti barang berhasil disimpan!"
    );

}


/* =========================================
   DATE
========================================= */

function formatDate(date) {

    return new Date(
        date
    ).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================
   TIME
========================================= */

function formatTime(date) {

    return new Date(
        date
    ).toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================
   RENDER PROOFS
========================================= */

function renderProofs() {

    if (!proofList) return;

    if (!proofs.length) {

        proofList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h3>
                    Belum ada bukti
                </h3>

                <p>
                    Buat bukti barang pertamamu.
                </p>

            </div>
        `;

        return;

    }

    proofList.innerHTML =
        proofs.map(
            function(proof) {

                const typeClass =
                    proof.type ===
                    "Pemasukan"
                        ? "income"
                        : "expense";

                const sign =
                    proof.type ===
                    "Pemasukan"
                        ? "+"
                        : "-";

                return `
                    <div
                        class="proof-card"
                        data-id="${proof.id}"
                    >

                        <div class="proof-image">

                            <img
                                src="${proof.photo}"
                                alt="${escapeHTML(
                                    proof.itemName
                                )}"
                            >

                        </div>


                        <div class="proof-info">

                            <h3>
                                ${escapeHTML(
                                    proof.itemName
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    proof.category
                                )}
                                •
                                ${formatDate(
                                    proof.date
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    proof.type
                                )}
                                •
                                ${formatTime(
                                    proof.date
                                )}
                            </p>

                            <div
                                class="proof-price ${typeClass}"
                            >
                                ${sign}
                                ${rupiah(
                                    proof.amount
                                )}
                            </div>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =========================================
   CLICK PROOF CARD
========================================= */

if (proofList) {

    proofList.addEventListener(
        "click",
        function(event) {

            const card =
                event.target.closest(
                    ".proof-card"
                );

            if (!card) return;

            const id =
                Number(
                    card.dataset.id
                );

            showDetail(id);

        }
    );

}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    if (totalProof) {

        totalProof.textContent =
            proofs.length;

    }

    const total =
        proofs.reduce(
            function(sum, proof) {

                return (
                    sum +
                    Number(
                        proof.amount
                    )
                );

            },
            0
        );

    if (totalValue) {

        totalValue.textContent =
            rupiah(total);

    }

}


/* =========================================
   DETAIL
========================================= */

function showDetail(id) {

    const proof =
        proofs.find(
            function(item) {

                return (
                    item.id === id
                );

            }
        );

    if (!proof) {

        alert(
            "Bukti tidak ditemukan."
        );

        return;

    }

    currentDetail =
        proof;

    const typeClass =
        proof.type ===
        "Pemasukan"
            ? "income"
            : "expense";

    const sign =
        proof.type ===
        "Pemasukan"
            ? "+"
            : "-";

    detailContent.innerHTML = `

        <img
            src="${proof.photo}"
            class="detail-photo"
            alt="Foto barang"
        >
  <div class="detail-card">

            <div class="detail-row">

                <span>
                    Barang
                </span>

                <span>
                    ${escapeHTML(
                        proof.itemName
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Jenis
                </span>

                <span
                    class="${typeClass}"
                >
                    ${escapeHTML(
                        proof.type
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Nominal
                </span>

                <span
                    class="${typeClass}"
                >
                    ${sign}
                    ${rupiah(
                        proof.amount
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Kategori
                </span>

                <span>
                    ${escapeHTML(
                        proof.category
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Tanggal
                </span>

                <span>
                    ${formatDate(
                        proof.date
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Waktu
                </span>

                <span>
                    ${formatTime(
                        proof.date
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Catatan
                </span>

                <span>
                    ${
                        proof.note
                            ? escapeHTML(
                                proof.note
                            )
                            : "-"
                    }
                </span>

            </div>

        </div>


        <button
            type="button"
            id="downloadDetailButton"
            class="save-button"
            style="margin-top:12px;"
        >
            📥 Simpan Foto
        </button>


        <button
            type="button"
            id="shareDetailButton"
            class="save-button"
            style="margin-top:10px;"
        >
            📤 Bagikan
        </button>


        <button
            type="button"
            id="deleteDetailButton"
            style="
                width:100%;
                margin-top:10px;
                padding:14px;
                border:none;
                border-radius:15px;
                background:#fee2e2;
                color:#dc2626;
                font-weight:800;
            "
        >
            🗑️ Hapus Bukti
        </button>

    `;

    detailModal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";


    document
        .getElementById(
            "downloadDetailButton"
        )
        .addEventListener(
            "click",
            downloadProof
        );


    document
        .getElementById(
            "shareDetailButton"
        )
        .addEventListener(
            "click",
            shareProof
        );


    document
        .getElementById(
            "deleteDetailButton"
        )
        .addEventListener(
            "click",
            function() {

                deleteProof(
                    proof.id
                );

            }
        );

}


/* =========================================
   CLOSE DETAIL
========================================= */

function closeDetail() {

    if (!detailModal) return;

    detailModal.classList.remove(
        "active"
    );

    currentDetail =
        null;

    document.body.style.overflow =
        "";

}


/* =========================================
   DELETE PROOF
========================================= */

function deleteProof(id) {

    const proof =
        proofs.find(
            function(item) {

                return item.id === id;

            }
        );

    if (!proof) return;

    const confirmDelete =
        confirm(
            `Hapus bukti "${proof.itemName}"?`
        );

    if (!confirmDelete) return;

    proofs =
        proofs.filter(
            function(item) {

                return item.id !== id;

            }
        );

    saveData();

    updateDashboard();

    renderProofs();

    closeDetail();

}


/* =========================================
   DELETE ALL
========================================= */

function clearAll() {

    if (!proofs.length) {

        alert(
            "Belum ada bukti."
        );

        return;

    }

    const confirmDelete =
        confirm(
            "Yakin ingin menghapus semua bukti?"
        );

    if (!confirmDelete) return;

    proofs = [];

    saveData();

    updateDashboard();

    renderProofs();

}


/* =========================================
   DOWNLOAD
========================================= */

function downloadProof() {

    if (!currentDetail) return;

    const link =
        document.createElement(
            "a"
        );

    link.href =
        currentDetail.photo;

    link.download =
        "bukti-" +
        cleanFileName(
            currentDetail.itemName
        ) +
        ".jpg";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

}


/* =========================================
   CLEAN FILE NAME
========================================= */

function cleanFileName(name) {

    return name
        .replace(
            /[^a-z0-9]/gi,
            "-"
        )
        .toLowerCase();

}


/* =========================================
   SHARE
========================================= */

async function shareProof() {

    if (!currentDetail) return;

    const proof =
        currentDetail;

    const text =
        `📸 BUKTI BARANG\n\n` +
        `Barang: ${proof.itemName}\n` +
        `Jenis: ${proof.type}\n` +
        `Nominal: ${rupiah(proof.amount)}\n` +
        `Kategori: ${proof.category}\n` +
        `Tanggal: ${formatDate(proof.date)}\n` +
        `Catatan: ${proof.note || "-"}`;

    try {

        const response =
            await fetch(
                proof.photo
            );

        const blob =
            await response.blob();

        const file =
            new File(
                [blob],
                "bukti-barang.jpg",
                {
                    type:
                        "image/jpeg"
                }
            );

        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [file]
            })
        ) {

            await navigator.share({

                title:
                    "Bukti Barang",

                text:
                    text,

                files:
                    [file]

            });

            return;

        }

    } catch (error) {

        console.log(
            "Share foto tidak tersedia.",
            error
        );

    }

    if (navigator.share) {

        try {

            await navigator.share({

                title:
                    "Bukti Barang",

                text:
                    text

            });

            return;

        } catch (error) {

            console.log(
                "Share dibatalkan."
            );

        }

    }

    try {

        await navigator.clipboard.writeText(
            text
        );

        alert(
            "Detail bukti berhasil disalin."
        );

    } catch (error) {

        alert(
            text
        );

    }

}


/* =========================================
   DARK MODE
========================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "buktiTheme"
        );

    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

    }

    updateThemeIcon();

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "buktiTheme",
        isDark
            ? "dark"
            : "light"
    );

    updateThemeIcon();

}


function updateThemeIcon() {

    if (!themeButton) return;

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    themeButton.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


/* =========================================
   BUTTON EVENTS
========================================= */

if (newProofButton) {

    newProofButton.addEventListener(
        "click",
        openForm
    );

}


if (closeFormButton) {

    closeFormButton.addEventListener(
        "click",
        closeForm
    );

}


if (cameraButton) {

    cameraButton.addEventListener(
        "click",
        openCamera
    );

}


if (closeCameraButton) {

    closeCameraButton.addEventListener(
        "click",
        closeCamera
    );

}


if (captureButton) {

    captureButton.addEventListener(
        "click",
        takePhoto
    );

}


if (closeDetailButton) {

    closeDetailButton.addEventListener(
        "click",
        closeDetail
    );

}


if (deleteAllButton) {

    deleteAllButton.addEventListener(
        "click",
        clearAll
    );

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );

}


/* =========================================
   CLICK OUTSIDE MODAL
========================================= */

if (formModal) {

    formModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                formModal
            ) {

                closeForm();

            }

        }
    );

}


if (cameraModal) {

    cameraModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                cameraModal
            ) {

                closeCamera();

            }

        }
    );

}


if (detailModal) {

    detailModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                detailModal
            ) {

                closeDetail();

            }

        }
    );

}


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeCamera();
            closeForm();
            closeDetail();

        }

    }
);


/* =========================================
   START APP
========================================= */

loadTheme();

updateDashboard();

renderProofs();

console.log(
    "Bukti Barang siap digunakan."
);
