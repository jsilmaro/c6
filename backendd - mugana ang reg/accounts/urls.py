from django.urls import path
from .views import RegisterView, LoginView, get_user

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("user/", get_user, name="user"),  # Endpoint for fetching user details
]
