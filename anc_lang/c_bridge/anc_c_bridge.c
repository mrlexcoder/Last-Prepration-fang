/*
 * anc_c_bridge.c
 * ANC Language - Low-level Linux C Bridge
 *
 * This is the core pro-level communication layer between the AGI and the Linux kernel.
 * Designed for maximum speed and direct OS control.
 *
 * The .anc runtime and the LivingSingularityKernel will call into this library.
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <signal.h>
#include <sys/ptrace.h>
#include <sys/wait.h>

/* === Core System Introspection === */

long anc_get_pid() {
    return (long)getpid();
}

long anc_get_tid() {
    return (long)syscall(SYS_gettid);
}

int anc_read_proc_status(char *buffer, size_t size) {
    int fd = open("/proc/self/status", O_RDONLY);
    if (fd < 0) return -1;
    ssize_t n = read(fd, buffer, size - 1);
    close(fd);
    if (n > 0) buffer[n] = '\0';
    return (int)n;
}

/* === Direct Memory Control === */

void* anc_mmap_anon(size_t size) {
    return mmap(NULL, size, PROT_READ | PROT_WRITE,
                MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
}

int anc_munmap(void *addr, size_t size) {
    return munmap(addr, size);
}

/* === Process & Signal Control === */

int anc_kill(pid_t pid, int sig) {
    return kill(pid, sig);
}

long anc_ptrace_attach(pid_t pid) {
    return ptrace(PTRACE_ATTACH, pid, NULL, NULL);
}

/* === Shared Memory (for fast AI <-> System communication) === */

int anc_shm_create(const char *name, size_t size) {
    int fd = shm_open(name, O_CREAT | O_RDWR, 0666);
    if (fd < 0) return -1;
    ftruncate(fd, size);
    return fd;
}

void* anc_shm_map(int fd, size_t size) {
    return mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
}

/* === High-Performance Vector / Neural Helpers (for .anc) === */

void anc_vector_add_f32(float *a, float *b, float *out, size_t n) {
    for (size_t i = 0; i < n; i++) {
        out[i] = a[i] + b[i];
    }
}

void anc_vector_dot_f32(float *a, float *b, float *result, size_t n) {
    float sum = 0.0f;
    for (size_t i = 0; i < n; i++) {
        sum += a[i] * b[i];
    }
    *result = sum;
}

/* === Error Handling === */

const char* anc_strerror(int err) {
    return strerror(err);
}
