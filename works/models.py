from django.db import models
from django.urls import reverse



class Category(models.Model):
    """Категория услуг"""
    title = models.CharField(max_length=250, verbose_name='Название категории')

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['id']


class Service(models.Model):
    """Услуги"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория', related_name='services')
    title = models.CharField(max_length=250, verbose_name='Название услуги')
    short_description = models.CharField(max_length=250, verbose_name='Краткое описание')
    description = models.TextField(blank=True, verbose_name='Полное описание')
    price = models.PositiveIntegerField(verbose_name='Цена')
    price_unit = models.CharField(max_length=250, blank=True, null=True, verbose_name='Единица измерения', help_text="Например: / м³, / шт, / пог.м, / кв.м")
    watched = models.IntegerField(default=0, verbose_name='Просмотры')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateField(auto_now=True, verbose_name='Последнее изменение')

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['-created_at']

    
    def get_main_image(self):
        """Возвращает главное изображение услуги"""
        # Сначала ищем изображение с is_main=True
        main = self.media.filter(media_type='image', is_main=True).first()
        if main:
            return main
        # Если нет главного, берем первое изображение
        return self.media.filter(media_type='image').first()


class ServiceFeature(models.Model):
    """Что входит в стоимость (список)"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name='Услуга', related_name='features')
    text = models.CharField(max_length=500, verbose_name='Текст пункта')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    
    def __str__(self):
        return self.text
    
    class Meta:
        verbose_name = 'Пункт "Что входит"'
        verbose_name_plural = 'Пункты "Что входит"'
        ordering = ['order']


class ServiceMedia(models.Model):
    """Общее медиа для услуги (универсальный вариант)"""
    MEDIA_TYPES = [
        ('image', 'Изображение'),
        ('video', 'Видео'),
    ]
    
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name='Услуга',related_name='media')
    media_type = models.CharField(max_length=255, choices=MEDIA_TYPES, default='image', verbose_name='Тип медиа')
    image = models.ImageField(upload_to='services/media/%Y/%m/', blank=True, null=True, verbose_name='Изображение')
    video = models.FileField(upload_to='services/media/%Y/%m/', blank=True, null=True, verbose_name='Видеофайл')
    title = models.CharField(max_length=250, blank=True, verbose_name='Название')
    is_main = models.BooleanField(default=False, verbose_name='Главное медиа')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')
    
    def __str__(self):
        return f"{self.service.title} - {self.get_media_type_display()} {self.order}"
    
    class Meta:
        verbose_name = 'Медиа'
        verbose_name_plural = 'Медиа'
        ordering = ['order', '-created_at']