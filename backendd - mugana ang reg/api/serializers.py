from rest_framework import serializers
from accounts.models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ("name", "email", "password")

    def create(self, validated_data):
        name = validated_data.pop("name")
        email = validated_data["email"]
        password = validated_data["password"]

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            name=name
        )
        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,  # Frontend expects an ID field
            "name": instance.name,
            "email": instance.email,
            "avatar": instance.avatar.url if instance.avatar else None,  # Ensuring compatibility with frontend data handling
            "preferences": instance.preferences  # Providing structured preferences data
        }
