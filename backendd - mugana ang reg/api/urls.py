from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, get_active_accounts, LogoutView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/user/", get_active_accounts, name="get_user"),  # Ensuring smooth frontend integration
    path("auth/active-accounts/", get_active_accounts, name="get_active_accounts"),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    # Extend for additional endpoints
    # path("auth/logout/", LogoutView.as_view(), name="logout"),
    # path("transactions/", TransactionView.as_view(), name="transactions"),
]
