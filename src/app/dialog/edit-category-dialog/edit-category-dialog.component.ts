import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {OperType} from "../OperType";
import {Category} from "../../model/Category";


@Component({
    selector: 'app-edit-category-dialog',
    templateUrl: './edit-category-dialog.component.html',
    styleUrls: ['./edit-category-dialog.component.css']
})

// создание/редактирование категории
export class EditCategoryDialogComponent implements OnInit {

    private dialogTitle: string; // текст для диалогового окна
    private categoryTitle: string; // текст для названия категории (при реактировании или добавлении)
  private category: Category;
    private operType: OperType; // тип операции

    constructor(
        private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для работы с текущим диалог. окном
        @Inject(MAT_DIALOG_DATA) private data: [Category, string, OperType], // данные, которые передали в диалоговое окно
        private dialog: MatDialog // для открытия нового диалогового окна (из текущего) - например для подтверждения удаления
    ) {
    }

    ngOnInit() {

        // получаем переданные в диалоговое окно данные
      this.category = this.data[0];
        this.categoryTitle = this.category.title;
        this.dialogTitle = this.data[1];
        this.operType = this.data[2]; // тип операции

    }

    // нажали ОК
    private onConfirm(): void {
      this.category.title = this.categoryTitle;
        this.dialogRef.close(this.category);
    }

    // нажали отмену (ничего не сохраняем и закрываем окно)
    private onCancel(): void {
        this.dialogRef.close(false);
    }

    // нажали Удалить
    private delete(): void {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {
                dialogTitle: 'Подтвердите действие',
                message: `Вы действительно хотите удалить категорию: "${this.categoryTitle}"? (сами задачи не удаляются)`
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dialogRef.close('delete'); // нажали удалить
            }
        });


    }

    // можно ли удалять (для показа/скрытия кнопки)
    private canDelete(): boolean {
        return this.operType === OperType.EDIT;
    }
}
