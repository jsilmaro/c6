from django.urls import path
from .views import RegisterView, LoginView, get_active_accounts

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/user/", get_active_accounts, name="get_user"),  # Ensuring smooth frontend integration
    path("auth/active-accounts/", get_active_accounts, name="get_active_accounts"),


    # Extend for additional endpoints
    # path("auth/logout/", LogoutView.as_view(), name="logout"),
    # path("transactions/", TransactionView.as_view(), name="transactions"),
]
