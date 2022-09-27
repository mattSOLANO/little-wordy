import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  addDoc, 
  collection, 
  collectionGroup, 
  connectFirestoreEmulator, 
  deleteDoc,
  doc, 
  getDocs, 
  getFirestore, 
  query, 
  serverTimestamp, 
  updateDoc, 
  where
} from "@angular/fire/firestore";
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';
import * as _ from 'lodash';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = false;
  inviteCode: string | undefined;
  tiles: any;
  user: User | undefined;
  createdGamesRef: any;
  userGamesRef: any;
  userGames: any[] = [];
  myGames: any[] = [];
  joinedGames: any[] = [];
  db = getFirestore();

  constructor(
    private router: Router,
    public authService: AuthService,
  ) { }

  async ngOnInit(): Promise<void> {
    if(location.hostname === "localhost") {
      try {
        connectFirestoreEmulator(this.db, "localhost", 8080);
      } catch (error) {}
    }

    this.user = this.authService.userData;
    this.createdGamesRef =  query(collection(this.db, `users/${this.user?.uid}/games`));
    this.userGamesRef = query(collectionGroup(this.db, 'games'), where('players', 'array-contains', this.user?.uid));
    
    const querySnapshot = await getDocs(this.userGamesRef);
    this.userGames = querySnapshot.docs.map((g: any) => {
      const data = g.data();
      data['date'] = formatDate(data['date'].toDate(), 'longDate', 'en');
      const id = g.id;
      return { id, ...data};
    });
    this.myGames = this.userGames.filter((game: any) => {
      return game.creatorId === this.user?.uid;
    });
    this.joinedGames = this.userGames.filter((game: any) => {
      return game.creatorId !== this.user?.uid;
    });

  }

  createGame() {

    if (!this.loading && this.user) {
      this.loading = true;
      const newGame = {
          creatorId: this.user.uid,
          date: serverTimestamp(),
          players: [this.user.uid],
          status: 'setup',
          inviteCode: '',
          PlayerA: {
              name: 'Team A',
              score: 0,
              displayName: this.user.displayName,
              ready: false
          },
          PlayerB: {
              name: 'Team B',
              score: 0,
              ready: false
          }
      };

      addDoc(this.createdGamesRef, newGame).then((game) => {
        updateDoc(game, {inviteCode: game.id.substring(0, 6).toUpperCase()}).then(() =>{
          this.router.navigate(['games/' + game.id]);
        });
      })
    }
    
  }

  goToGame(gameId: string) {
    this.router.navigate(['games/' +  gameId]);
  }

  findGame(inviteCode?: string) {
    inviteCode = inviteCode?.toUpperCase();
    const inviteQuery = query(collectionGroup(this.db, 'games'), where('inviteCode', '==', inviteCode));
    getDocs(inviteQuery).then((games) => {
      if (!games.size) {
        window.alert('No game found with that code');
      } else {
          this.router.navigate(['games/' + games.docs[0].id]);
      }
    })
  }

  async deleteGame(gameId: string, userId: string) {
    await deleteDoc(doc(this.db, 'users/' + userId + '/games/' + gameId)).then(() => {
      _.remove(this.myGames, (game) => {
        return game.id === gameId;
      });
    });
  }

}
