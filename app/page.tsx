export default function Page() {
  return (
    <div className="border p-4">
      <a href="/auth/login" className="border p-2 mr-2">
        Login
      </a>
      <a href="/auth/register" className="border p-2">
        Register
      </a>
    </div>
  );
}
