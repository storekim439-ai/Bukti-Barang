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


