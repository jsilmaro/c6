from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from accounts.serializers import UserSerializer
from accounts.models import CustomUser
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import check_password



class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                "token": str(refresh.access_token),
                "user": UserSerializer(user).data  # Uses serializer for structured response
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        print(f"Received Login Request: email={email}, password={password}")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Find user in the database
        user = CustomUser.objects.filter(email=email).first()
        print("User Found:", user)  # Debugging step: Prints user details or None if user isn't found

        if not user:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Step 2: Verify password matches
        password_matches = check_password(password, user.password)
        print("Password Match:", password_matches)  # Debug password validation

        if not password_matches:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Step 3: Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_active_accounts(request):
    user = request.user
    active_accounts = [
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar": user.avatar.url if user.avatar else None,
            "isActive": True  # Ensuring the logged-in user is marked as active
        }
    ]
    return Response(active_accounts, status=status.HTTP_200_OK)
