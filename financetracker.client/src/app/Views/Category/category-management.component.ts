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
  @ViewChild('categoryForm') categoryForm!: NgForm;

  // Data
  categories: Category[] = [];

  // --- CHANGE 1: Ensure it starts true ---
  isLoading = true;

  // UI State
  isCategoryModalOpen = false;
  isEditMode = false;

  // Form Model
  selectedCategory: CategoryCreateDto | Category;

  // Deletion State
  isDeleteModalOpen = false;
  categoryToDeleteId: number | null = null;
  categoryToDeleteName: string = '';

  // Dropdown options
  categoryTypes: ('Income' | 'Expense')[] = ['Expense', 'Income'];

  // Economy / finance-related icons mapped to PrimeIcons names (label/value)
  availableIcons: { label: string; value: string }[] = [
    { label: '', value: 'dollar' },
    { label: '', value: 'home' },
    { label: '', value: 'bolt' },
    { label: '', value: 'credit-card' },
    { label: '', value: 'wallet' },
    { label: '', value: 'file' },
    { label: '', value: 'phone' },
    { label: '', value: 'light' },
  ];

  // Dropdown-friendly icon options (same shape)
  iconOptions: { label: string; value: string }[] = this.availableIcons;

  // (dialog resize reverted) — no dialogStyle or dropdown handlers
  constructor(private categoryService: CategoryService) {
    this.selectedCategory = this.resetCategoryForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Fetches all categories.
   */
  loadCategories(): void {
    // 1. Turn spinner ON
    this.isLoading = true;

    this.categoryService.getCategories()
      .pipe(
        // 2. Turn spinner OFF when done
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          console.error('Failed to load categories', err);
        }
      });
  }

  resetCategoryForm(): CategoryCreateDto {
    return {
      name: '',
      type: 'Expense',
      icon: null as any
    };
  }

  // --- Modal Management ---

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategory = this.resetCategoryForm();
    this.isCategoryModalOpen = true;
    // Ensure the form control is reset so the dropdown shows the placeholder
    setTimeout(() => {
      try {
        if (this.categoryForm) {
          this.categoryForm.resetForm(this.selectedCategory as any);
        }
      } catch (e) {
        // ignore if form not yet available
      }
    }, 0);
  }

  async openEditModal(id: number): Promise<void> {
    this.isLoading = true; // Spinner ON while fetching single item
    this.isEditMode = true;
    try {
      const category = await this.categoryService.getCategory(id).toPromise();
      this.selectedCategory = category as Category;
      this.isCategoryModalOpen = true;
    } catch (err) {
      console.error(`Failed to fetch category ${id}`, err);
    } finally {
      this.isLoading = false; // Spinner OFF
    }
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.selectedCategory = this.resetCategoryForm();
  }

  // --- CRUD Operations ---

  triggerSave(): void {
    if (this.categoryForm) {
      this.saveCategory(this.categoryForm);
    } else {
      console.error('Form reference is not available.');
    }
  }

  // --- CHANGE 2: Saving Logic ---
  saveCategory(form: NgForm): void {
    if (form.invalid) {
      console.error('Please fill out all required fields.');
      return;
    }

    if (!this.selectedCategory) {
      console.error('Category data is missing.');
      return;
    }

    // 1. Turn spinner ON
    this.isLoading = true;

    // Helper to clean up state after success/error
    const handleComplete = () => {
      this.isLoading = false; // Turn spinner OFF
      this.closeCategoryModal();
      this.loadCategories(); // Will trigger spinner again briefly
    };

    const handleError = (err: any) => {
      this.isLoading = false; // Turn spinner OFF
      console.error('Failed to save category:', err);
    };

    if (this.isEditMode) {
      // UPDATE LOGIC
      const updateDto: CategoryUpdateDto = this.selectedCategory as CategoryUpdateDto;

      if (!('categoryId' in this.selectedCategory)) {
        console.error('Cannot update category: ID missing.');
        this.isLoading = false; // Ensure spinner turns off if we abort here
        return;
      }
      const id = (this.selectedCategory as Category).categoryId;

      this.categoryService.updateCategory(id, updateDto)
        .subscribe({ next: handleComplete, error: handleError });

    } else {
      // CREATE LOGIC
      const createDto: CategoryCreateDto = this.selectedCategory as CategoryCreateDto;

      this.categoryService.createCategory(createDto)
        .subscribe({ next: handleComplete, error: handleError });
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

  // --- CHANGE 3: Deletion Logic ---
  confirmDelete(): void {
    if (this.categoryToDeleteId !== null) {

      // 1. Turn spinner ON
      this.isLoading = true;

      this.categoryService.deleteCategory(this.categoryToDeleteId)
        .pipe(
          // 2. Ensure spinner turns off (or hands over to loadCategories)
          finalize(() => this.isLoading = false)
        )
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
