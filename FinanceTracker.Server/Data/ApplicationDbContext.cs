using Microsoft.EntityFrameworkCore;
using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Data
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public virtual DbSet<Budget> Budgets { get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<Goal> Goals { get; set; }
        public virtual DbSet<Import> Imports { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<Transaction> Transactions { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<ExpenseLimit> ExpenseLimits { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                //optionsBuilder.UseSqlServer("Server=DESKTOP-K6CTF30,1433;Database=finance_tracker;User Id=sa;Password=kleaklea2003;TrustServerCertificate=True;");
                optionsBuilder.UseSqlServer("Server=35.190.192.133;Database=HotelManagement;User Id=anisa;Password=anisa123;TrustServerCertificate=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasKey(e => e.BudgetId).HasName("PK__budgets__3A655C14FA65DED8");

                entity.HasOne(d => d.Category)
                      .WithMany(p => p.Budgets)
                      .HasConstraintName("FK__budgets__categor__4F7CD00D");

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Budgets)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK__budgets__user_id__4E88ABD4");
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.CategoryId).HasName("PK__categori__D54EE9B4F14E27CF");

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Categories)
                      .HasConstraintName("FK__categorie__user___3C69FB99");
            });

            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasKey(e => e.GoalId).HasName("PK__goals__76679A2423BEF933");
                entity.Property(e => e.CurrentAmount).HasDefaultValue(0.00m);

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Goals)
                      .HasConstraintName("FK__goals__user_id__534D60F1");
            });

            modelBuilder.Entity<Import>(entity =>
            {
                entity.HasKey(e => e.ImportId).HasName("PK__imports__F3E6B05FD40CE171");

                entity.Property(e => e.Status).HasDefaultValue("pending");
                entity.Property(e => e.UploadDate).HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Imports)
                      .HasConstraintName("FK__imports__user_id__5FB337D6");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationId).HasName("PK__notifica__E059842F177DDA98");

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.Type).HasDefaultValue("general");

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Notifications)
                      .HasConstraintName("FK__notificat__user___59FA5E80");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.TransactionId).HasName("PK__transact__85C600AF0912DB24");

                entity.HasOne(d => d.Category)
                      .WithMany(p => p.Transactions)
                      .OnDelete(DeleteBehavior.SetNull)
                      .HasConstraintName("FK__transacti__categ__46E78A0C");

                entity.HasOne(d => d.User)
                      .WithMany(p => p.Transactions)
                      .OnDelete(DeleteBehavior.ClientSetNull)
                      .HasConstraintName("FK__transacti__user___45F365D3");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F1A049626");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            });

            base.OnModelCreating(modelBuilder);
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
