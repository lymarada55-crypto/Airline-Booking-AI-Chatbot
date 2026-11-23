<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserAdminController extends Controller
{
    public function __construct(
        protected UserRepository $repo
    ) {}

    // GET /admin/users
    public function index(Request $request)
    {
        $sortDir = $request->get('sort', 'asc');
        $users = $this->repo->getAll($request->search, $request->role, $sortDir);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? 'member',
                'membership_tier' => ucfirst($user->membership_tier ?? 'standard'),
                'is_vip' => (bool) ($user->is_vip ?? false),
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            ];
        });

        $totalAll = User::count();
        $vipCount = User::whereIn('membership_tier', ['vip', 'VIP', 'platinum', 'Platinum', 'gold', 'Gold'])
            ->count();
        $newUsersCount = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        $payload = $users->toArray();
        $payload['summary'] = [
            'total_users' => $totalAll,
            'active_users' => $totalAll,
            'vip_users' => $vipCount,
            'new_users' => $newUsersCount,
        ];

        return response()->json($payload);
    }

    // GET ONE
    public function show($id)
    {
        $user = $this->repo->find($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->roles->first()?->name ?? 'member',
            'membership_tier' => ucfirst($user->membership_tier ?? 'standard'),
            'is_vip' => (bool) ($user->is_vip ?? false),
            'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
        ]);
    }

    // CREATE
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:admin,member,user',
            'membership_tier' => 'nullable|in:standard,gold,vip,platinum',
        ]);

        $tier = strtolower($validated['membership_tier'] ?? 'standard');
        $user = User::create([
            'name' => trim($validated['name']),
            'email' => trim($validated['email']),
            'password' => Hash::make($validated['password']),
            'membership_tier' => $tier,
        ]);

        $roleName = ($validated['role'] ?? 'member') === 'admin' ? 'admin' : 'member';
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $user->roles()->sync([$role->id]);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $roleName,
            'membership_tier' => ucfirst($tier),
        ], 201);
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|in:admin,member,user',
            'membership_tier' => 'nullable|in:standard,gold,vip,platinum',
        ]);

        if (isset($validated['name'])) {
            $user->name = trim($validated['name']);
        }
        if (isset($validated['email'])) {
            $user->email = trim($validated['email']);
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        if (isset($validated['membership_tier'])) {
            $tier = strtolower($validated['membership_tier']);
            $user->membership_tier = $tier;
        }
        $user->save();

        if (isset($validated['role'])) {
            $roleName = $validated['role'] === 'admin' ? 'admin' : 'member';
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        $user->load('roles');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->roles->first()?->name ?? 'member',
            'membership_tier' => ucfirst($user->membership_tier ?? 'standard'),
        ]);
    }

    // DELETE
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Không thể tự xóa tài khoản quản trị đang đăng nhập.',
            ], 422);
        }

        $this->repo->delete($user);

        return response()->json([
            'message' => 'Đã xóa người dùng thành công.',
        ]);
    }
}
