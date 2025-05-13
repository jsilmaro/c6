
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import TransactionView, BudgetView, ReportsView, RegisterView, LoginView, LogoutView, get_active_accounts
from accounts.views import (
    update_profile, change_password, update_preferences
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/user/", get_active_accounts, name="get_user"),
    path("auth/active-accounts/", get_active_accounts, name="get_active_accounts"),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/update/', update_profile, name='update_profile'),
    path('auth/password/change/', change_password, name='change_password'),
    path('auth/preferences/update/', update_preferences, name='update_preferences'),

    # Transactions endpoints
    path("transactions/", TransactionView.as_view(), name="transactions-list"),
    path("transactions/<str:transaction_id>/", TransactionView.as_view(), name="transaction-detail"),
    
    # Budget endpoints
    path("budgets/", BudgetView.as_view(), name="budgets-list"),
    path("budgets/<str:budget_id>/", BudgetView.as_view(), name="budget-detail"),
    
    # Reports endpoints
    path("reports/<str:report_type>/", ReportsView.as_view(), name="reports"),
]
