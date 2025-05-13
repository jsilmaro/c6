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
from django.utils import timezone


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create user with proper password hashing
        user = CustomUser.objects.create_user(
            email=request.data["email"],
            name=request.data["name"],
            password=request.data["password"]
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if 'avatar' in request.FILES:
        user.avatar = request.FILES['avatar']
    if 'name' in request.data:
        user.name = request.data['name']
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    if not check_password(request.data['current_password'], user.password):
        return Response({'error': 'Current password is incorrect'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if 'avatar' in request.FILES:
        user.avatar = request.FILES['avatar']
    if 'name' in request.data:
        user.name = request.data['name']
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    if not check_password(request.data['current_password'], user.password):
        return Response({'error': 'Current password is incorrect'}, status=400)
    user.set_password(request.data['new_password'])
    user.last_password_change = timezone.now()
    user.save()
    return Response({'message': 'Password updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_preferences(request):
    user = request.user
    user.preferences.update(request.data)
    user.save()
    return Response(user.preferences)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if 'avatar' in request.FILES:
        user.avatar = request.FILES['avatar']
    if 'name' in request.data:
        user.name = request.data['name']
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    if not check_password(request.data['current_password'], user.password):
        return Response({'error': 'Current password is incorrect'}, status=400)
    user.set_password(request.data['new_password'])
    user.last_password_change = timezone.now()
    user.save()
    return Response({'message': 'Password updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_preferences(request):
    user = request.user
    user.preferences.update(request.data)
    user.save()
    return Response(user.preferences)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from .serializers import UserSerializer

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
        if 'name' in request.data:
            user.name = request.data['name']
        user.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not check_password(old_password, user.password):
        return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password updated successfully'})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_preferences(request):
    user = request.user
    preferences = request.data.get('preferences', {})
    
    if not isinstance(preferences, dict):
        return Response({'error': 'Invalid preferences format'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update only valid preference fields
    valid_preferences = {
        'currency': preferences.get('currency', user.preferences.get('currency', 'USD')),
        'email_alerts': preferences.get('email_alerts', user.preferences.get('email_alerts', True)),
        'weekly_reports': preferences.get('weekly_reports', user.preferences.get('weekly_reports', True)),
        'budget_alerts': preferences.get('budget_alerts', user.preferences.get('budget_alerts', True))
    }
    
    user.preferences = valid_preferences
    user.save()
    return Response(valid_preferences)
