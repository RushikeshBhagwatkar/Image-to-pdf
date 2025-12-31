let files = [];
let draggedIndex = null;

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

dropZone.onclick = () => fileInput.click();
fileInput.onchange = e => addFiles(e.target.files);

dropZone.ondragover = e => e.preventDefault();
dropZone.ondrop = e => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
};

function addFiles(selected) {
  [...selected].forEach(file => files.push(file));
  renderPreview();
}

function renderPreview() {
  preview.innerHTML = "";

  files.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "relative group";
    wrapper.draggable = true;

    wrapper.ondragstart = () => draggedIndex = index;
    wrapper.ondragover = e => e.preventDefault();
    wrapper.ondrop = () => reorderImage(index);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.className = "rounded-lg border cursor-move";

    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "✕";
    removeBtn.className =
      "absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full hidden group-hover:block";
    removeBtn.onclick = () => removeImage(index);

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    preview.appendChild(wrapper);
  });
}

function reorderImage(targetIndex) {
  const temp = files[draggedIndex];
  files.splice(draggedIndex, 1);
  files.splice(targetIndex, 0, temp);
  renderPreview();
}

function removeImage(index) {
  files.splice(index, 1);
  renderPreview();
}

function resetAll() {
  files = [];
  preview.innerHTML = "";
}

function convertPDF() {
  if (!files.length) {
    alert("Upload images first");
    return;
  }

  const formData = new FormData();
  files.forEach(f => formData.append("images", f));

  fetch("/convert", { method: "POST", body: formData })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "images.pdf";
      a.click();
    });
}
