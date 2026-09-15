/* =========================================
   BUKTI BARANG
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   DATA
========================================= */

let proofs =
    JSON.parse(
        localStorage.getItem("buktiBarang")
    ) || [];

let currentPhoto = "";

let currentDetail = null;


/* =========================================
   ELEMENT
========================================= */

const formModal =
    document.getElementById("formModal");

const detailModal =
    document.getElementById("detailModal");

const proofList =
    document.getElementById("proofList");

const totalProof =
    document.getElementById("totalProof");

const totalValue =
    document.getElementById("totalValue");

const photoPreview =
    document.getElementById("photoPreview");

const cameraInput =
    document.getElementById("cameraInput");

const galleryInput =
    document.getElementById("galleryInput");


/* =========================================
   STORAGE
========================================= */

function saveData() {

    localStorage.setItem(
        "buktiBarang",
        JSON.stringify(proofs)
    );

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
    ).format(number);

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

    formModal.classList.add("active");

    currentPhoto = "";

    resetPhotoPreview();

    document.getElementById(
        "itemName"
    ).value = "";

    document.getElementById(
        "amount"
    ).value = "";

    document.getElementById(
        "transactionType"
    ).value = "Pemasukan";

    document.getElementById(
        "category"
    ).value = "Barang";

    document.getElementById(
        "note"
    ).value = "";

    cameraInput.value = "";

    galleryInput.value = "";

}


/* =========================================
   CLOSE FORM
========================================= */

function closeForm() {

    formModal.classList.remove("active");

}


/* =========================================
   PHOTO PREVIEW RESET
========================================= */

function resetPhotoPreview() {

    photoPreview.classList.remove(
        "has-image"
    );

    photoPreview.innerHTML = `
        <div class="camera-icon">
            📷
        </div>

        <p>
            Belum ada foto barang
        </p>
    `;

}


/* =========================================
   HANDLE PHOTO
========================================= */

function handlePhoto(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert(
            "File yang dipilih harus berupa gambar."
        );

        return;

    }


    /*
       Resize foto supaya localStorage
       tidak cepat penuh.
    */

    compressImage(
        file,
        1200,
        0.78
    )
    .then(function(dataURL) {

        currentPhoto = dataURL;

        photoPreview.classList.add(
            "has-image"
        );

        photoPreview.innerHTML = `
            <img
                src="${dataURL}"
                alt="Foto barang"
            >
        `;

    })
    .catch(function(error) {

        console.error(error);

        alert(
            "Foto gagal diproses."
        );

    });

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
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = function(e) {

                const img =
                    new Image();


                img.onload = function() {

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
                            (maxWidth / width);

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
                    e.target.result;

            };


            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   SAVE PROOF
========================================= */

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
            "📷 Silakan foto barang terlebih dahulu."
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
            now.toISOString(),

        createdAt:
            now.toLocaleString(
                "id-ID"
            )

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
   FORMAT DATE
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
   FORMAT TIME
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
                    Foto barang pertamamu dan simpan
                    sebagai bukti transaksi.
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
                        onclick="showDetail(${proof.id})"
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
                                ${proof.type}
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
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    totalProof.textContent =
        proofs.length;


    const total =
        proofs.reduce(
            function(sum, proof) {

                return sum +
                    Number(
                        proof.amount
                    );

            },
            0
        );


    totalValue.textContent =
        rupiah(total);

}


/* =========================================
   SHOW DETAIL
========================================= */

function showDetail(id) {

    const proof =
        proofs.find(
            function(item) {

                return item.id === id;

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


    document.getElementById(
        "detailContent"
    ).innerHTML = `

        <img
            src="${proof.photo}"
            class="detail-photo"
            alt="Foto ${escapeHTML(
                proof.itemName
            )}"
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

                <span class="${typeClass}">
                    ${proof.type}
                </span>

            </div>


            <div class="detail-row">

                <span>
                    Nominal
                </span>

                <span class="${typeClass}">
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
            onclick="deleteProof(${proof.id})"
            style="
                width:100%;
                margin-top:10px;
                padding:13px;
                border:none;
                border-radius:14px;
                background:#fee2e2;
                color:#dc2626;
                font-weight:800;
                cursor:pointer;
            "
        >
            🗑️ Hapus Bukti
        </button>

    `;


    detailModal.classList.add(
        "active"
    );

}


/* =========================================
   CLOSE DETAIL
========================================= */

function closeDetail() {

    detailModal.classList.remove(
        "active"
    );

    currentDetail = null;

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


    alert(
        "Bukti berhasil dihapus."
    );

}


/* =========================================
   DELETE ALL
========================================= */

function clearAll() {

    if (!proofs.length) {

        alert(
            "Belum ada bukti yang tersimpan."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Yakin ingin menghapus SEMUA bukti?"
        );


    if (!confirmDelete) return;


    proofs = [];

    saveData();

    updateDashboard();

    renderProofs();


    alert(
        "Semua bukti berhasil dihapus."
    );

}


/* =========================================
   DOWNLOAD PHOTO
========================================= */

function downloadProof() {

    if (!currentDetail) {

        alert(
            "Bukti tidak ditemukan."
        );

        return;

    }


    const link =
        document.createElement("a");


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

    if (!currentDetail) {

        alert(
            "Bukti tidak ditemukan."
        );

        return;

    }


    const proof =
        currentDetail;


    const text =

        `📸 BUKTI BARANG\n\n` +

        `Barang: ${
            proof.itemName
        }\n` +

        `Jenis: ${
            proof.type
        }\n` +

        `Nominal: ${
            rupiah(
                proof.amount
            )
        }\n` +

        `Kategori: ${
            proof.category
        }\n` +

        `Tanggal: ${
            formatDate(
                proof.date
            )
        }\n` +

        `Catatan: ${
            proof.note || "-"
        }`;


    /*
       Coba share bersama foto
       jika browser Android
       mendukung Web Share API.
    */

    try {

        const response =
            await fetch(
                proof.photo
            );


        const blob =
            await response.blob();


        const file =
            new File(
                [
                    blob
                ],
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


    /*
       Fallback kalau browser
       tidak mendukung share file.
    */

    if (
        navigator.share
    ) {

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


    /*
       Fallback terakhir:
       copy informasi ke clipboard.
    */

    try {

    await navigator.clipboard.writeText(text);

    alert("Detail bukti berhasil disalin.");

} catch (error) {

    alert("Gagal membagikan atau menyalin detail bukti.");

}

}


/* =========================================
   OPEN CAMERA
========================================= */

function openCamera() {

    const camera =
        document.getElementById("cameraInput");

    if (!camera) {

        alert("Kamera tidak ditemukan.");

        return;

    }

    camera.click();

}
