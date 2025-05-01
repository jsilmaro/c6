from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = CustomUser.objects.get(email=request.data["email"])
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "token": str(refresh.access_token),  # Send JWT token to frontend
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar.url if user.avatar else None,
                "preferences": user.preferences,
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        # Step 1: Get email and password from the request
        email = request.data.get("email")
        password = request.data.get("password")

        # Step 2: Check if both fields are provided
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Find user in the database using email
        user = CustomUser.objects.filter(email=email).first()
        print("User Found:", user)  # Debugging step: Prints None if no user exists

        # Step 4: Check if user exists and if password matches
        if not user or not check_password(password, user.password):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Step 5: Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Step 6: Return the access token and user info in the response
        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # Requires authentication to access this endpoint
def get_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar.url if user.avatar else None,
        "preferences": user.preferences,
    })
