FROM python:3.11

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y

RUN apt install -y autoconf autogen automake build-essential libasound2-dev \
libflac-dev libogg-dev libtool libvorbis-dev libopus-dev libmp3lame-dev \
libmpg123-dev pkg-config libsndfile1
RUN pip install -r requirements.txt

CMD ["uvicorn", "api:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

