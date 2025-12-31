from flask import Flask, render_template, request, send_file
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from io import BytesIO

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/convert", methods=["POST"])
def convert():
    images = request.files.getlist("images")

    page_size = request.form.get("pageSize", "original")
    orientation = request.form.get("orientation", "portrait")

    # Create in-memory buffer (NO FILE SYSTEM USAGE)
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer)

    for img in images:
        image = Image.open(img)

        # Decide page size
        if page_size == "a4":
            size = landscape(A4) if orientation == "landscape" else A4
            width, height = size
        else:
            width, height = image.size

        c.setPageSize((width, height))

        # Convert image mode if needed
        if image.mode != "RGB":
            image = image.convert("RGB")

        c.drawInlineImage(image, 0, 0, width, height)
        c.showPage()

    c.save()
    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name="images.pdf",
        mimetype="application/pdf"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

