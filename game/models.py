from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    white_player = models.ForeignKey(User, related_name="white_games", on_delete=models.CASCADE, null=True, blank=True)
    black_player = models.ForeignKey(User, related_name="black_games", on_delete=models.CASCADE, null=True, blank=True)
    fen = models.CharField(
        max_length=100, 
        default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Move(models.Model):
    game = models.ForeignKey(Game, related_name="moves", on_delete=models.CASCADE)
    move_uci = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)

# Create your models here.
