from django.contrib import admin
from .models import Category, Service, ServiceFeature, ServiceMedia

class ServiceFeatureInline(admin.TabularInline):
    model = ServiceFeature
    extra = 3
    fields = ['text', 'order']
    ordering = ['order']

class ServiceMediaInline(admin.TabularInline):
    model = ServiceMedia
    extra = 3
    fields = ['media_type', 'image', 'video', 'title', 'is_main', 'order']
    ordering = ['order']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'id']
    search_fields = ['title']
    prepopulated_fields = {}  # если нужно

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'price_unit', 'watched', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'short_description', 'description']
    inlines = [ServiceFeatureInline, ServiceMediaInline]
    readonly_fields = ['created_at', 'updated_at', 'watched']

    fieldsets = (
        ('Основная информация', {
            'fields': ('category', 'title', 'short_description', 'description')
        }),
        ('Цена', {
            'fields': ('price', 'price_unit')
        }),
        ('Статистика', {
            'fields': ('watched',),
            'classes': ('collapse',)
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )