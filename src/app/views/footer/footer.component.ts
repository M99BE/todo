import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {AboutDialogComponent} from "../../dialog/about/about-dialog.component";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})

// "presentational component": отображает полученные данные
// подвал - нижняя часть страницы
export class FooterComponent implements OnInit {
    testTranslate: string;
    private year: Date;
    private site = 'https://www.avid.ru/';
    private blog = 'https://www.avid.ru/about/activity/';
    private siteName = 'АО "ОДК Авиадвигатель"';

    constructor(
      private dialog: MatDialog,
      private translateService: TranslateService
                ) {

    }

    ngOnInit() {
        this.year = new Date(); // текуший год
      this.translateService.get('TEST.FIRST').subscribe(obj => {
        this.testTranslate = obj;
        console.log(this.testTranslate);
      });
    }

    // окно "О программе"
    private openAboutDialog() {
      console.log(this.translateService.instant('TEST.SECOND'));
        this.dialog.open(AboutDialogComponent,
            {
                autoFocus: false,
                data: {
                    dialogTitle: 'Название диалога',
                    message: 'Описание диалога'
                },
                width: '400px'
            });

    }

}
