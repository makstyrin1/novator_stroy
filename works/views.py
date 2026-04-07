from django.views.generic import TemplateView, DetailView
from django.shortcuts import get_object_or_404
from django.db.models import F
from .models import Service, Category


class HomeView(TemplateView):
    """Главная страница"""
    template_name = 'home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['services'] = Service.objects.all()[:6]
        context['categories'] = Category.objects.all()
        return context


class AboutView(TemplateView):
    """Страница о компании"""
    template_name = 'about.html'


class ServiceListView(TemplateView):
    """Страница со всеми услугами"""
    template_name = 'service_list.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['services'] = Service.objects.all()
        context['all_services'] = Service.objects.all()  # ДОБАВЛЯЕМ ВСЕ УСЛУГИ
        context['categories'] = Category.objects.all()
        context['current_category'] = None
        return context


class ServiceDetailView(DetailView):
    """Детальная страница услуги"""
    model = Service
    template_name = 'service_detail.html'
    context_object_name = 'service'
    
    def get_object(self, queryset=None):
        service = super().get_object(queryset)
        Service.objects.filter(pk=service.pk).update(watched=F('watched') + 1)
        service.refresh_from_db()
        return service
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        service = self.object
        
        context['media_items'] = service.media.all()
        
        main_media = service.media.filter(is_main=True).first()
        if not main_media:
            main_media = service.media.first()
        context['main_media'] = main_media
        
        return context


class CategoryDetailView(TemplateView):
    """Страница услуг по категории"""
    template_name = 'service_list.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category_id = self.kwargs.get('category_id')
        self.category = get_object_or_404(Category, id=category_id)
        
        context['services'] = Service.objects.filter(category=self.category)
        context['all_services'] = Service.objects.all()  # ДОБАВЛЯЕМ ВСЕ УСЛУГИ
        context['categories'] = Category.objects.all()
        context['current_category'] = self.category
        
        return context