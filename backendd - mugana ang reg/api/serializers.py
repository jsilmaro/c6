from rest_framework import serializers
from accounts.models import CustomUser
from .models import Budget

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
    
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'category', 'description', 'date', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        if data['type'] == 'expense' and data['category'] in dict(Transaction.INCOME_CATEGORIES):
            raise serializers.ValidationError("Invalid category for expense type")
        elif data['type'] == 'income' and data['category'] in dict(Transaction.EXPENSE_CATEGORIES):
            raise serializers.ValidationError("Invalid category for income type")
        return data
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount', 'period', 'start_date', 'end_date', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        if data['amount'] <= 0:
            raise serializers.ValidationError("Budget amount must be greater than 0")
        return data
