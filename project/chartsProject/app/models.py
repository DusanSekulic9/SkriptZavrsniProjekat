from django.db import models

class Telefon(models.Model):
    marka = models.TextField()
    model = models.TextField()
    procesor = models.TextField()
    verzija = models.TextField()
    cena = models.TextField()

    def __str__(self):
        return self.marka + ': ' + self.model

class Tablet(models.Model):
    marka = models.TextField()
    model = models.TextField()
    procesor = models.TextField()
    verzija = models.TextField()
    cena = models.TextField()

    def __str__(self):
        return self.marka
