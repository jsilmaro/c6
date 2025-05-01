from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "name", "is_active", "is_staff"]
    search_fields = ["email", "name"]

admin.site.register(CustomUser, CustomUserAdmin)
