import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ref, getDatabase, push, connectDatabaseEmulator, serverTimestamp, update} from '@angular/fire/database';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = false;
  tiles: any;
  user: User | undefined;
  db = getDatabase();

  constructor(
    private router: Router,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    if(location.hostname === "localhost") {
      connectDatabaseEmulator(this.db, "localhost", 9000);
    }

    this.user = this.authService.userData;

  }

  createGame() {
    const gamesListRef = ref(this.db, 'games');
    const newGamesRef = push(gamesListRef);
    const newGameKey = newGamesRef.key;
    const updates: any = {};

    updates['invites/' + newGameKey?.substring(13, 19).toUpperCase()] = {
      gameId: newGameKey
    }
    updates['games/' + newGameKey] = {
      id: newGameKey,
      creatorId: this.user?.uid,
      date: serverTimestamp()
    }
    updates['users/' + this.user?.uid + '/games/' + newGameKey] = {
      id: newGameKey,
      date: serverTimestamp()
    }

    update (ref(this.db), updates).then(() => {
      this.router.navigate(['games/' + newGamesRef.key]);
    });
    
  }

}
