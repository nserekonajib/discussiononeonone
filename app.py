from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/send_email', methods=['POST'])
def send_email():
    try:
        # Extract form data from the request
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        message = data.get("message")

        # Validate required fields
        if not name or not email or not subject or not message:
            return jsonify({"error": "All fields are required"}), 400

        # Email sender configuration
        sender_email = "nserekonajib3@gmail.com"
        receiver_email = "zayyanclenza@gmail.com"
        password = "lfut ganq izxq ssqd"  # Replace with your app password

        # Construct the email content
        email_subject = f"Contact Form Submission: {subject}"
        email_body = f"""
        Name: {name}
        Email: {email}
        
        Message:
        {message}
        """

        # Create the email
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = receiver_email
        msg["Subject"] = email_subject
        msg.attach(MIMEText(email_body, "plain"))

        # Send the email via SMTP
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return jsonify({"message": "Email sent successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5555)
