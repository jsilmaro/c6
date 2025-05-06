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
            user = serializer.save(commit=False) #prevent premature saving
            user.set_password(serializer.validated_data["password"]) #hash pass correctly
            
            user.save() 

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

        user = CustomUser.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

        print(f"Stored Password for {email}: {user.password}")  # Debugging
        password_matches = check_password(password, user.password)
        print(f"Password Match: {password_matches}")  # Debugging

        if not password_matches:
            return Response({"error": "Invalid password."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)    

class LogoutView(APIView):
    def post(self, request):
        try:
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
        
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




