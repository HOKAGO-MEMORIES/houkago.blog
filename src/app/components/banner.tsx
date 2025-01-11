export default function Banner() {
    return (
        <div className="block w-full aspect-[16/9] p-6 bg-cover bg-no-repeat  bg-center bg-[url('/home/main.jpg')]">
            <h1 className="text-5xl font-semibold text-primary break-all">
                방과후 블로그
            </h1>
            <p className="text-xl break-all text-muted mt-4">
                YONGHWI KIM
            </p>
        </div>
    );
}