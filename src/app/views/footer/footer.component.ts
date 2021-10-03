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
    private site = 'https://javabegin.ru/';
    private blog = 'https://javabegin.ru/blog/tag/angular/';
    private siteName = 'JavaBegin';

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
                    dialogTitle: 'О программе',
                    message: 'Данное приложение было создано для видеокурса "Angular для начинающих" на сайте javabegin.ru'
                },
                width: '400px'
            });

    }

}
