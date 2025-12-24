using Microsoft.AspNetCore.Identity;

namespace CafeOrderSystem.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = new[] { "Admin", "Customer" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
        public static async Task SeedAdminAsync(UserManager<IdentityUser> userManager)
        {
            string adminUserName = "admin1";
            string adminEmail = "admin1@example.com";
            string adminPassword = "1qaz@WSX";

            var existingAdmin = await userManager.FindByNameAsync(adminUserName);
            if (existingAdmin == null)
            {
                var admin = new IdentityUser
                {
                    UserName = adminUserName,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to create admin user: {errors}");
                }
            }
        }
    }
}
