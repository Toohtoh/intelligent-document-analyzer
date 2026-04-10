# ============================================================
# STAGE 1 — Builder : installe les dépendances
# ============================================================
FROM python:3.11-slim AS builder

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Copie uniquement requirements.txt d'abord
# (optimisation du cache Docker — si requirements ne change pas,
#  cette couche est réutilisée sans réinstaller)
COPY requirements.txt .

# Installation des dépendances dans un dossier séparé
RUN pip install --upgrade pip && \
    pip install --prefix=/install -r requirements.txt

# ============================================================
# STAGE 2 — Runtime : image finale légère
# ============================================================
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Création d'un utilisateur non-root pour la sécurité
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copie uniquement les dépendances installées depuis le builder
COPY --from=builder /install /usr/local

# Copie le code source de l'application
COPY app/ ./app/

# Change le propriétaire des fichiers
RUN chown -R appuser:appuser /app

# Bascule vers l'utilisateur non-root
USER appuser

# Expose le port FastAPI
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]