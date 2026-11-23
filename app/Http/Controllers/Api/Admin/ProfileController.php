<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'membership_tier' => ucfirst($user->membership_tier ?? 'standard'),
                'role' => $user->roles->first()?->name ?? 'admin',
                'roles' => $user->roles,
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'current_password' => 'required_with:password|nullable|string',
            'password' => 'nullable|string|min:6',
        ], [
            'name.required' => 'Vui lòng nhập họ và tên.',
            'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác.',
            'current_password.required_with' => 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.',
            'password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        ]);

        if ($request->filled('password')) {
            if (! Hash::check((string) $request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mật khẩu hiện tại không chính xác.',
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->name = trim((string) $request->name);
        $user->email = trim((string) $request->email);
        $user->save();
        $user->load('roles');

        return response()->json([
            'status' => 'success',
            'message' => 'Đã cập nhật hồ sơ quản trị viên thành công.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'membership_tier' => ucfirst($user->membership_tier ?? 'standard'),
                'role' => $user->roles->first()?->name ?? 'admin',
                'roles' => $user->roles,
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            ],
        ]);
    }
}
