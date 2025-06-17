import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_certificate_analysis(cert_id):
    prompt = f"Sertifika ID: {cert_id}. Bu sertifikanın geçerliliği ve önemi hakkında doğrudan bilgi ver. Gereksiz giriş cümleleri olmasın."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Sen teknik belgeleri analiz eden bir uzmansın. Bilgilendirici, kısa ve doğrudan cevap ver."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=120,
            temperature=0.4
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Hata oluştu: {str(e)}"

def ask_about_certificate(cert_id, user_question, lang="en"):
    if lang == "tr":
        prompt = (
            f"Kullanıcı, '{cert_id}' numaralı sertifika hakkında şu soruyu sordu:\n"
            f"\"{user_question}\"\n"
            f"Lütfen anlaşılır, kısa ve doğrudan bir yanıt ver."
        )
    else:
        prompt = (
            f"The user asked the following question about certificate ID '{cert_id}':\n"
            f"\"{user_question}\"\n"
            f"Please provide a clear, concise, and direct answer."
        )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a certificate verification assistant." if lang == "en"
                               else "Sen bir sertifika doğrulama asistanısın."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=150,
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Hata oluştu: {str(e)}"
