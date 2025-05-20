from django.contrib import admin
from .models import CustomUser
from api.models import Transaction, Budget

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "name", "avatar", "preferences", "is_active", "is_staff"]
    search_fields = ["email", "name"]

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'type', 'category', 'date']
    list_filter = ['type', 'category', 'date']
    search_fields = ['description', 'user__email']

class BudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'amount', 'period', 'start_date', 'end_date']
    list_filter = ['category', 'period']
    search_fields = ['user__email']

admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Budget, BudgetAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
