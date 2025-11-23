import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoryService, Category, CategoryCreateDto, CategoryUpdateDto } from '../../services/categories/category.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  // CRITICAL FIX 1: Get a reference to the form using @ViewChild
  @ViewChild('categoryForm') categoryForm!: NgForm;

  // Data
  categories: Category[] = [];
  isLoading = true;

  // UI State
  isCategoryModalOpen = false;
  isEditMode = false;

  // Form Model: Removed | undefined since it's always initialized.
  selectedCategory: CategoryCreateDto | Category;

  // Deletion State
  isDeleteModalOpen = false;
  categoryToDeleteId: number | null = null;
  categoryToDeleteName: string = '';

  // Dropdown options
  categoryTypes: ('Income' | 'Expense')[] = ['Expense', 'Income'];

  // Example icons (you should define a proper list)
  availableIcons = [
    'shopping_cart', 'attach_money', 'home', 'electric_bolt', 'local_dining'
  ];

  constructor(private categoryService: CategoryService) {
    // Initialization ensures selectedCategory is never undefined
    this.selectedCategory = this.resetCategoryForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Fetches all categories for the current user from the API.
   */
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          console.error('Failed to load categories', err);
          // Using console.error instead of alert as per general instruction
        }
      });
  }

  /**
   * Resets the form model for a new category.
   */
  resetCategoryForm(): CategoryCreateDto {
    return {
      name: '',
      type: 'Expense', // Default to Expense
      icon: 'shopping_cart'
    };
  }

  // --- Modal Management ---

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategory = this.resetCategoryForm();
    this.isCategoryModalOpen = true;
  }

  async openEditModal(id: number): Promise<void> {
    this.isLoading = true;
    this.isEditMode = true;
    try {
      // Fetch the category to populate the form
      const category = await this.categoryService.getCategory(id).toPromise();
      this.selectedCategory = category as Category; // Ensure type consistency for editing
      this.isCategoryModalOpen = true;
    } catch (err) {
      console.error(`Failed to fetch category ${id}`, err);
    } finally {
      this.isLoading = false;
    }
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.selectedCategory = this.resetCategoryForm();
  }

  // --- CRUD Operations ---

  /**
   * CRITICAL FIX 2: New method to trigger submission from the footer button.
   * It checks the ViewChild reference and passes it to the main save method.
   */
  triggerSave(): void {
    if (this.categoryForm) {
      this.saveCategory(this.categoryForm);
    } else {
      console.error('Form reference is not available.');
    }
  }

  saveCategory(form: NgForm): void {
    // Form validation is now done correctly using the NgForm object
    if (form.invalid) {
      console.error('Please fill out all required fields.');
      return;
    }

    // Safety check to ensure selectedCategory is an object before proceeding
    if (!this.selectedCategory) {
      console.error('Category data is missing.');
      return;
    }

    if (this.isEditMode) {
      // UPDATE LOGIC
      const updateDto: CategoryUpdateDto = this.selectedCategory as CategoryUpdateDto;

      if (!('categoryId' in this.selectedCategory)) {
        console.error('Cannot update category: ID missing.');
        return;
      }
      const id = (this.selectedCategory as Category).categoryId;

      this.categoryService.updateCategory(id, updateDto)
        .subscribe({
          next: () => {
            this.closeCategoryModal();
            this.loadCategories();
          },
          error: (err) => {
            console.error('Failed to update category:', err);
          }
        });
    } else {
      // CREATE LOGIC
      const createDto: CategoryCreateDto = this.selectedCategory as CategoryCreateDto;

      this.categoryService.createCategory(createDto)
        .subscribe({
          next: () => {
            this.closeCategoryModal();
            this.loadCategories();
          },
          error: (err) => {
            console.error('Failed to create category:', err);
          }
        });
    }
  }

  openDeleteModal(category: Category): void {
    this.categoryToDeleteId = category.categoryId;
    this.categoryToDeleteName = category.name;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.categoryToDeleteId = null;
    this.categoryToDeleteName = '';
  }

  confirmDelete(): void {
    if (this.categoryToDeleteId !== null) {
      this.categoryService.deleteCategory(this.categoryToDeleteId)
        .subscribe({
          next: () => {
            this.closeDeleteModal();
            this.loadCategories(); // Reload data
          },
          error: (err) => {
            console.error('Failed to delete category', err);
            this.closeDeleteModal();
          }
        });
    }
  }
}
